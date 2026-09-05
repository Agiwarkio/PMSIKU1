package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"pms-backend/config"
	"pms-backend/models"
	"pms-backend/services"
)

func GetGraduates(c *gin.Context) {
	var graduates []models.Graduate
	if err := config.DB.Order("last_traced desc").Find(&graduates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch graduates"})
		return
	}
	c.JSON(http.StatusOK, graduates)
}

func CreateGraduate(c *gin.Context) {
	var graduate models.Graduate
	if err := c.ShouldBindJSON(&graduate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Calculate Score
	graduate.IndividualScore = services.CalculateIKU1IndividualScore(&graduate)
	graduate.LastTraced = time.Now()

	if err := config.DB.Create(&graduate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create graduate"})
		return
	}

	c.JSON(http.StatusOK, graduate)
}

func UpdateGraduate(c *gin.Context) {
	id := c.Param("id")
	var graduate models.Graduate
	if err := config.DB.First(&graduate, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Graduate not found"})
		return
	}

	if err := c.ShouldBindJSON(&graduate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Recalculate Score
	graduate.IndividualScore = services.CalculateIKU1IndividualScore(&graduate)
	graduate.LastTraced = time.Now()

	if err := config.DB.Save(&graduate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update graduate"})
		return
	}

	c.JSON(http.StatusOK, graduate)
}

func DeleteGraduate(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Graduate{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete graduate"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Graduate deleted"})
}

func GetSummary(c *gin.Context) {
	var conf models.Configuration
	config.DB.First(&conf)

	var graduates []models.Graduate
	config.DB.Find(&graduates)

	totalRespondents := len(graduates)
	validRespondents := 0
	var sumScore float64 = 0

	for _, g := range graduates {
		if g.Status != models.StatusBelumTerlacak {
			validRespondents++
		}
		sumScore += g.IndividualScore
	}

	minSlovin := services.CalculateSlovinMinimum(conf.TotalGraduates)
	var finalScore float64 = 0
	
	if totalRespondents >= minSlovin && conf.TotalGraduates > 0 {
		finalScore = (sumScore / float64(conf.TotalGraduates)) * 100
	}

	c.JSON(http.StatusOK, gin.H{
		"totalRespondents": totalRespondents,
		"validRespondents": validRespondents,
		"minSlovin":        minSlovin,
		"score":            finalScore,
		"responseRateOk":   totalRespondents >= minSlovin,
	})
}

func AITrace(c *gin.Context) {
	var req struct {
		NIM            string `json:"nim"`
		UniversityName string `json:"universityName"`
		Name           string `json:"name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := services.TraceGraduateWithAI(context.Background(), req.NIM, req.UniversityName, req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func AIValidateSalary(c *gin.Context) {
	var req struct {
		JobTitle     string  `json:"jobTitle"`
		Income       float64 `json:"income"`
		ProvinceName string  `json:"provinceName"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := services.ValidateSalaryWithAI(context.Background(), req.JobTitle, req.Income, req.ProvinceName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}
