package models

import (
	"time"

	"gorm.io/gorm"
)

type GraduateStatus string

const (
	StatusBekerja          GraduateStatus = "Bekerja"
	StatusMelanjutkanStudi GraduateStatus = "Melanjutkan Studi"
	StatusWirausaha        GraduateStatus = "Wirausaha"
	StatusBelumTerlacak    GraduateStatus = "Belum Terlacak"
)

type Configuration struct {
	ID                 uint   `gorm:"primaryKey"`
	UniversityName     string `gorm:"default:'Universitas Hamzanwadi'"`
	TotalGraduates     int    `gorm:"default:0"`
	UniversityStructure string `gorm:"type:text"` // JSON representation for simplicity
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

type Graduate struct {
	ID                   string         `gorm:"primaryKey"`
	Name                 string         `gorm:"not null"`
	NIM                  string         `gorm:"not null"`
	GraduationYear       int
	Status               GraduateStatus `gorm:"not null"`
	WaitingMonths        int
	Income               float64
	WorkLocationProvince string
	CompanyName          string
	JobTitle             string
	LastTraced           time.Time
	IndividualScore      float64
	EvidenceID           string         // Store document ID if any
	EvidenceName         string         // Store document name
	IsSalaryAnomalous    bool
	SalaryJustification  string
	AIVerificationStatus string
	CreatedAt            time.Time
	UpdatedAt            time.Time
	DeletedAt            gorm.DeletedAt `gorm:"index"`
}
