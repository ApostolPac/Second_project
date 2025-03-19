package db

import (
	"database/sql"
	"fmt"
	"laba3/internal/models"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var db *sql.DB

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Ошибка загрузки .env файла")
	}
}

func ConnectToDb() {

	var err error
	var ConnectString string = fmt.Sprintf("host=%v port=%v user=%v password=%v dbname=%v sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)
	db, err = sql.Open("postgres", ConnectString)

	if err != nil {
		log.Fatal("Ошибка доступа к базе данных")
	}
	fmt.Println("ConnectString =", ConnectString)
	err = db.Ping()
	if err != nil {
		log.Fatal("Ошибка подключения к базе данных", err)
	}
	log.Print("Успешное подключение")
}

func GetStudents() []models.Student {
	rows, err := db.Query("SELECT id, name, email FROM students")
	if err != nil {
		log.Fatal(err)
	}
	students := make([]models.Student, 0)
	for rows.Next() {
		var student models.Student
		err := rows.Scan(&student.Id, &student.Name, &student.Email)
		if err != nil {
			log.Fatal(err)
		}
		students = append(students, student)
	}
	return students
}

func GetCourses() (array []models.Course) {
	rows, err := db.Query("SELECT id, title, description FROM courses")
	if err != nil {
		log.Fatal(err)
	}
	courses := make([]models.Course, 0)
	for rows.Next() {
		var course models.Course
		err := rows.Scan(&course.Id, &course.Title, &course.Description)
		if err != nil {
			log.Fatal(err)
		}
		courses = append(courses, course)
	}
	return courses
}

func GetEnrollments() (array []models.Enrollment) {
	rows, err := db.Query("SELECT id, student_id, course_id, enrolled_at FROM enrollments")
	if err != nil {
		log.Fatal(err)
	}
	enrollments := make([]models.Enrollment, 0)
	for rows.Next() {
		var enrollment models.Enrollment
		err := rows.Scan(&enrollment.Id, &enrollment.StudentId, &enrollment.CourseId, &enrollment.EnrolledAt)

		if err != nil {
			log.Fatal(err)
		}
		enrollments = append(enrollments, enrollment)
	}
	return enrollments
}

func CreateStudent(student models.Student) error {

	_, err := db.Exec("INSERT INTO students (name, email) VALUES ($1, $2)", student.Name, student.Email)
	if err != nil {
		return err
	}

	return nil
}

func CreateCourse(course models.Course) error {
	_, err := db.Exec("INSERT INTO courses (title, description) VALUES ($1, $2)", course.Title, course.Description)
	if err != nil {
		return err
	}
	return nil
}

func CreateEnroll(enrollment models.Enrollment) error {

	_, err := db.Exec("INSERT INTO enrollments (student_id, course_id, enrolled_at) VALUES ($1, $2, NOW())",
		enrollment.StudentId, enrollment.CourseId)
	if err != nil {
		log.Printf("Ошибка при создании записи: %v. Данные: student_id=%d, course_id=%d",
			err, enrollment.StudentId, enrollment.CourseId)
		return err
	}
	return nil

}

func UpdateStudent(student models.Student, id int) error {

	result, err := db.Exec("UPDATE students SET name=$1, email=$2 WHERE id=$3",
		student.Name, student.Email, id,
	)
	if err != nil {
		return err
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {

		return fmt.Errorf("student not found for update")
	}

	return nil
}

func UpdateCourse(course models.Course, id int) error {

	result, err := db.Exec("UPDATE courses SET title=$1, description=$2 WHERE id=$3",
		course.Title, course.Description, id,
	)
	if err != nil {
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("course not found for update")
	}

	return nil
}

func UpdateEnrollment(enrollment models.Enrollment, id int) error {

	result, err := db.Exec(`
        UPDATE enrollments
        SET student_id=$1, course_id=$2, enrolled_at=$3
        WHERE id=$4
    `,
		enrollment.StudentId,
		enrollment.CourseId,
		enrollment.EnrolledAt,
		id,
	)
	if err != nil {
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("enrollment not found for update")
	}

	return nil
}

func DeleteStudent(id int) error {
	result, err := db.Exec("DELETE FROM students WHERE id = $1", id)
	if err != nil {
		return err
	}
	RowsAffected, _ := result.RowsAffected()
	if RowsAffected == 0 {
		return fmt.Errorf("student not found")
	}
	return nil
}
func DeleteCourse(id int) error {
	result, err := db.Exec("DELETE FROM courses WHERE id = $1", id)
	if err != nil {
		return err
	}
	RowsAffected, _ := result.RowsAffected()
	if RowsAffected == 0 {
		return fmt.Errorf("course not found")
	}
	return nil
}
func DeleteEnrollment(id int) error {
	result, err := db.Exec("DELETE FROM enrollments WHERE id = $1", id)
	if err != nil {
		return err
	}
	RowsAffected, _ := result.RowsAffected()
	if RowsAffected == 0 {
		return fmt.Errorf("enrollemnt not found")
	}
	return nil
}
