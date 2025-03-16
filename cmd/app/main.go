package main

import (
	"laba3/internal/db"
	"laba3/internal/router"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	db.ConnectToDb()

	r := gin.Default()

	// Настройка CORS с разрешением необходимых заголовков и методов
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.SetupRouters(r)

	log.Println("Сервер запущен на :8080")
	r.Run(":8080")
}