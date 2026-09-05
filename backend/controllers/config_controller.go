package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"pms-backend/config"
	"pms-backend/models"
)

func GetConfig(c *gin.Context) {
	var conf models.Configuration
	if err := config.DB.First(&conf).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch config"})
		return
	}
	c.JSON(http.StatusOK, conf)
}

func UpdateConfig(c *gin.Context) {
	var req models.Configuration
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var conf models.Configuration
	if err := config.DB.First(&conf).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch config"})
		return
	}

	conf.UniversityName = req.UniversityName
	conf.TotalGraduates = req.TotalGraduates
	conf.UniversityStructure = req.UniversityStructure

	if err := config.DB.Save(&conf).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save config"})
		return
	}

	c.JSON(http.StatusOK, conf)
}
