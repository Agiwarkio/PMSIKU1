package services

import (
	"pms-backend/models"
)

// UMP Data mapping
var umpData = map[string]float64{
	"AC": 3460672,
	"SU": 2809915,
	"SB": 2811449,
	"RI": 3294625,
	"KR": 3402492,
	"JA": 3037121,
	"SS": 3456874,
	"BB": 3640000,
	"BE": 2507079,
	"LA": 2716497,
	"JK": 5067381,
	"JB": 2057495,
	"BT": 2727812,
	"JT": 2036947,
	"YO": 2125897,
	"JI": 2165244,
	"BA": 2813671,
	"NB": 2444067,
	"NT": 2186826,
	"KB": 2702616,
	"KT": 3261616,
	"KS": 3282812,
	"KI": 3360858,
	"KU": 3361653,
	"SA": 3545000,
	"ST": 2736698,
	"SG": 2885964,
	"SN": 3434298,
	"SR": 2914958,
	"GO": 3025100,
	"MA": 2919331,
	"MU": 3200000,
	"PA": 4024270,
	"PB": 3393000,
	"LN": 0,
}

func getUMP(provinceCode string) float64 {
	if val, ok := umpData[provinceCode]; ok {
		return val
	}
	return umpData["JB"] // Default to Jawa Barat
}

func CalculateIKU1IndividualScore(graduate *models.Graduate) float64 {
	if graduate.Status == models.StatusBelumTerlacak {
		return 0
	}
	if graduate.Status == models.StatusMelanjutkanStudi {
		return 1.2
	}

	if graduate.Status == models.StatusBekerja || graduate.Status == models.StatusWirausaha {
		if graduate.WaitingMonths <= 6 {
			ump := getUMP(graduate.WorkLocationProvince)
			if graduate.WorkLocationProvince == "LN" || graduate.Income >= 1.2*ump {
				return 1.2
			}
			return 1.0
		}

		if graduate.WaitingMonths > 6 && graduate.WaitingMonths <= 12 {
			ump := getUMP(graduate.WorkLocationProvince)
			if graduate.WorkLocationProvince == "LN" || graduate.Income >= 1.2*ump {
				return 1.2
			}
			return 1.0
		}
	}

	return 0
}

func CalculateSlovinMinimum(population int) int {
	if population <= 0 {
		return 0
	}
	marginOfError := 0.05
	n := float64(population) / (1 + float64(population)*marginOfError*marginOfError)
	
	// Math.ceil equivalent
	if n == float64(int(n)) {
		return int(n)
	}
	return int(n) + 1
}
