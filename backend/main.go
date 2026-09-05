package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"pms-backend/config"
	"pms-backend/controllers"
)

func main() {
	// Load environment variables (ignore errors if file not found)
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	// Initialize Database
	config.ConnectDatabase()

	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API Routes
	api := r.Group("/api")
	{
		// Auth
		api.POST("/auth/login", controllers.Login)
		api.GET("/auth/me", controllers.GetMe)

		// Configuration
		api.GET("/config", controllers.GetConfig)
		api.POST("/config", controllers.UpdateConfig)

		// Graduates
		api.GET("/graduates", controllers.GetGraduates)
		api.POST("/graduates", controllers.CreateGraduate)
		api.PUT("/graduates/:id", controllers.UpdateGraduate)
		api.DELETE("/graduates/:id", controllers.DeleteGraduate)

		// Summary
		api.GET("/summary", controllers.GetSummary)

		// AI
		api.POST("/ai/trace", controllers.AITrace)
		api.POST("/ai/validate-salary", controllers.AIValidateSalary)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
