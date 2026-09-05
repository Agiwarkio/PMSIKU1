package controllers

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UserResponse struct {
	Username string `json:"username"`
	Name     string `json:"name"`
	Role     string `json:"role"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username dan password wajib diisi"})
		return
	}

	adminUser := os.Getenv("ADMIN_USERNAME")
	if adminUser == "" {
		adminUser = "admin"
	}

	adminPass := os.Getenv("ADMIN_PASSWORD")
	if adminPass == "" {
		adminPass = "admin123"
	}

	if req.Username != adminUser || req.Password != adminPass {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Username atau password salah"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"token":   "pms-admin-session-token-valid",
		"user": UserResponse{
			Username: adminUser,
			Name:     "Administrator PMS",
			Role:     "Admin",
		},
	})
}

func GetMe(c *gin.Context) {
	adminUser := os.Getenv("ADMIN_USERNAME")
	if adminUser == "" {
		adminUser = "admin"
	}

	c.JSON(http.StatusOK, gin.H{
		"user": UserResponse{
			Username: adminUser,
			Name:     "Administrator PMS",
			Role:     "Admin",
		},
	})
}
