package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"pms-backend/models"
)

var DB *gorm.DB

func ConnectDatabase() {
	// Load .env if it exists
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}
	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "kio@123"
	}
	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "pms_db"
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta", host, user, password, dbname, port)
	
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Migrate the schema
	err = database.AutoMigrate(&models.Configuration{}, &models.Graduate{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Initialize default configuration if empty
	var count int64
	database.Model(&models.Configuration{}).Count(&count)
	if count == 0 {
		database.Create(&models.Configuration{
			UniversityName: "Universitas Hamzanwadi",
			TotalGraduates: 0,
			UniversityStructure: "[]",
		})
	}

	DB = database
	log.Println("Database connection successfully opened")
}
