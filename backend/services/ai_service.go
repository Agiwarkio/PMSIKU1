package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"
)

// AI Validation result structure
type AIValidationResult struct {
	IsAnomalous   bool   `json:"isAnomalous"`
	Justification string `json:"justification"`
}

// AI Graduate trace result structure
type AIGraduateTraceResult struct {
	FoundName          string `json:"foundName,omitempty"`
	Status             string `json:"status"`
	Details            string `json:"details"`
	Evidence           string `json:"evidence"`
	DiscoveredUrl      string `json:"discoveredUrl,omitempty"`
	VerificationStatus string `json:"verificationStatus"`
}

type geminiRequest struct {
	Contents []struct {
		Parts []struct {
			Text string `json:"text"`
		} `json:"parts"`
	} `json:"contents"`
	GenerationConfig struct {
		ResponseMimeType string `json:"responseMimeType"`
	} `json:"generationConfig"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
	Error *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Status  string `json:"status"`
	} `json:"error,omitempty"`
}

func getAPIKey() string {
	if key := os.Getenv("GEMINI_API_KEY"); key != "" {
		return key
	}
	if key := os.Getenv("VITE_API_KEY"); key != "" {
		return key
	}
	return os.Getenv("API_KEY")
}

func callGeminiAPI(ctx context.Context, prompt string) (string, error) {
	apiKey := getAPIKey()
	if apiKey == "" {
		return "", fmt.Errorf("API Key Gemini tidak ditemukan di environment (GEMINI_API_KEY/VITE_API_KEY)")
	}

	models := []string{
		"gemini-3.6-flash",
		"gemini-3.7-flash",
		"gemini-3.5-flash",
		"gemini-flash-latest",
	}

	reqPayload := geminiRequest{}
	reqPayload.Contents = append(reqPayload.Contents, struct {
		Parts []struct {
			Text string `json:"text"`
		} `json:"parts"`
	}{
		Parts: []struct {
			Text string `json:"text"`
		}{{Text: prompt}},
	})
	reqPayload.GenerationConfig.ResponseMimeType = "application/json"

	jsonBytes, err := json.Marshal(reqPayload)
	if err != nil {
		return "", err
	}

	client := &http.Client{Timeout: 45 * time.Second}
	var lastErr error

	for _, model := range models {
		url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, apiKey)
		req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBytes))
		if err != nil {
			lastErr = err
			continue
		}
		req.Header.Set("Content-Type", "application/json")

		resp, err := client.Do(req)
		if err != nil {
			lastErr = err
			continue
		}

		body, readErr := io.ReadAll(resp.Body)
		resp.Body.Close()
		if readErr != nil {
			lastErr = readErr
			continue
		}

		if resp.StatusCode != http.StatusOK {
			lastErr = fmt.Errorf("model %s HTTP %d: %s", model, resp.StatusCode, string(body))
			continue
		}

		var gemResp geminiResponse
		if err := json.Unmarshal(body, &gemResp); err != nil {
			lastErr = err
			continue
		}

		if len(gemResp.Candidates) > 0 && len(gemResp.Candidates[0].Content.Parts) > 0 {
			text := gemResp.Candidates[0].Content.Parts[0].Text
			if strings.TrimSpace(text) != "" {
				return text, nil
			}
		}
	}

	if lastErr != nil {
		return "", lastErr
	}
	return "", fmt.Errorf("gagal mendapatkan respon dari AI Gemini")
}

func ValidateSalaryWithAI(ctx context.Context, jobTitle string, income float64, provinceName string) (*AIValidationResult, error) {
	prompt := fmt.Sprintf(`Kamu adalah sistem AI analis ketenagakerjaan dan kompensasi gaji untuk IKU 1 Tracer Study Indonesia.
Analisis apakah tingkat gaji berikut wajar atau anomali (terlalu rendah di bawah UMR / terlalu tinggi tidak masuk akal untuk jabatannya):
- Jabatan: "%s"
- Gaji Bulanan: IDR %.0f
- Lokasi Kerja (Provinsi): "%s"

Kembalikan HANYA JSON sesuai format berikut:
{
  "isAnomalous": false,
  "justification": "Penjelasan rinci dari AI mengenai analisis kelayakan gaji sesuai UMR dan standar pasar"
}`, jobTitle, income, provinceName)

	responseText, err := callGeminiAPI(ctx, prompt)
	if err != nil {
		return nil, fmt.Errorf("AI Error: %v", err)
	}

	var result AIValidationResult
	if err := json.Unmarshal([]byte(responseText), &result); err != nil {
		cleanJSON := strings.TrimPrefix(responseText, "```json")
		cleanJSON = strings.TrimPrefix(cleanJSON, "```")
		cleanJSON = strings.TrimSuffix(cleanJSON, "```")
		cleanJSON = strings.TrimSpace(cleanJSON)

		if err2 := json.Unmarshal([]byte(cleanJSON), &result); err2 != nil {
			return nil, fmt.Errorf("gagal memproses JSON AI: %v (raw response: %s)", err2, responseText)
		}
	}

	return &result, nil
}

type ScraperStudent struct {
	Nama      string `json:"nama"`
	NIM       string `json:"nim"`
	NamaPT    string `json:"nama_pt"`
	NamaProdi string `json:"nama_prodi"`
}

type ScraperResult struct {
	Success bool            `json:"success"`
	Keyword string          `json:"keyword"`
	Student *ScraperStudent `json:"student,omitempty"`
	Error   string          `json:"error,omitempty"`
}

func runCamoufoxScraper(ctx context.Context, keyword string, targetUniv string) (*ScraperResult, error) {
	scraperPath := "scraper/camoufox_scraper.py"
	if _, err := os.Stat(scraperPath); os.IsNotExist(err) {
		scraperPath = "backend/scraper/camoufox_scraper.py"
	}

	cmd := exec.CommandContext(ctx, "python", scraperPath, keyword, targetUniv)
	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	var res ScraperResult
	if err := json.Unmarshal(output, &res); err != nil {
		return nil, err
	}
	return &res, nil
}

func TraceGraduateWithAI(ctx context.Context, nim string, universityName string, name string) (*AIGraduateTraceResult, error) {
	univ := universityName
	if univ == "" {
		univ = "Universitas Hamzanwadi"
	}

	// 1. Jalankan Camoufox Stealth Scraper ke situs resmi PDDikti Kemdiktisaintek
	var scrapedInfo string
	scraperRes, err := runCamoufoxScraper(ctx, nim, univ)
	if err == nil && scraperRes != nil && scraperRes.Success && scraperRes.Student != nil {
		name = scraperRes.Student.Nama
		scrapedInfo = fmt.Sprintf("\n[DATA RESMI TERVERIFIKASI LANGSUNG DARI PDDIKTI KEMDIKTISAINTEK]:\n• Nama Mahasiswa Resmi: %s\n• NIM: %s\n• Perguruan Tinggi: %s\n• Program Studi: %s\n(Gunakan nama lengkap resmi dan program studi ini persis seperti data PDDikti di atas!)\n",
			scraperRes.Student.Nama, scraperRes.Student.NIM, scraperRes.Student.NamaPT, scraperRes.Student.NamaProdi)
	}

	prompt := fmt.Sprintf(`Kamu adalah sistem kecerdasan buatan (AI) pelacak karir alumni dan verifikator data akademik perguruan tinggi untuk pemenuhan IKU 1 Kemendikbudristek/Kemdiktisaintek.
Lakukan ekstraksi dan analisis komprehensif data akademik dan penelusuran karir alumni berdasarkan data:
- NIM: "%s"
- Nama Mahasiswa: "%s"
- Perguruan Tinggi: "%s"
%s

Petunjuk Penelusuran & Ekstraksi Data:
1. Identifikasi dan ekstrak seluruh data akademik yang melekat pada struktur NIM di perguruan tinggi tersebut:
   - Program Studi / Jurusan (Dekode kode prodi pada digit NIM secara tepat sesuai nomenklatur program studi di kampus tersebut)
   - Fakultas dan Jenjang Pendidikan (contoh: Strata 1 / Diploma)
   - Tahun Masuk (Angkatan) & Estimasi Tahun Kelulusan
   - Status Akademik Mahasiswa pada pangkalan data (Lulus)
2. Jika nama mahasiswa diinputkan, cocokkan entitas nama tersebut. Jika tidak diisi, berikan identifikasi nama entitas lulusan terverifikasi berdasarkan rekam jejak akademik NIM.
3. Rincikan bidang 'details' dengan format poin-poin terstruktur yang SANGAT JELAS dan LENGKAP:
   Riwayat Akademik:
   • Nama Mahasiswa: [Nama Lengkap]
   • NIM: [NIM]
   • Perguruan Tinggi: [Nama Kampus]
   • Fakultas: [Fakultas]
   • Program Studi / Jurusan: [Jurusan]
   • Jenjang: [S1 / D3 / S2]
   • Angkatan (Tahun Masuk): [Tahun]
   • Status Kelulusan: Lulus
   
   Rekam Jejak Karir & Pekerjaan:
   • Posisi / Jabatan: [Pekerjaan/Profesi]
   • Instansi / Perusahaan: [Nama Lembaga/Perusahaan]
   • Kesesuaian Bidang IKU 1: [Sesuai / Melanjutkan Studi / Wirausaha]
4. Bidang 'evidence' memuat penjelasan bukti verifikasi algoritma AI mengenai validitas data dan kriteria IKU 1.
5. Bidang 'status' bernilai salah satu dari: "Bekerja", "Melanjutkan Studi", "Wirausaha", atau "Belum Terlacak".
6. Bidang 'verificationStatus' bernilai salah satu dari: "Verified", "Needs Confirmation", atau "Not Found".

Kembalikan HANYA JSON sesuai format berikut:
{
  "foundName": "Nama Lengkap Mahasiswa",
  "status": "Bekerja",
  "details": "Rincian poin-poin lengkap: Program Studi, Fakultas, Jenjang, Angkatan, Status Lulus, dan Rincian Karir",
  "evidence": "Penjelasan bukti analisis AI secara ilmiah",
  "verificationStatus": "Verified"
}`, nim, name, univ, scrapedInfo)

	responseText, err := callGeminiAPI(ctx, prompt)
	if err != nil {
		return nil, fmt.Errorf("AI Error: %v", err)
	}

	var result AIGraduateTraceResult
	if err := json.Unmarshal([]byte(responseText), &result); err != nil {
		cleanJSON := strings.TrimPrefix(responseText, "```json")
		cleanJSON = strings.TrimPrefix(cleanJSON, "```")
		cleanJSON = strings.TrimSuffix(cleanJSON, "```")
		cleanJSON = strings.TrimSpace(cleanJSON)

		if err2 := json.Unmarshal([]byte(cleanJSON), &result); err2 != nil {
			return nil, fmt.Errorf("gagal memproses JSON AI: %v (raw response: %s)", err2, responseText)
		}
	}

	return &result, nil
}
