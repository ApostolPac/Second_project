import { useEffect, useState } from "react";
import "./App.css";

function Section({ title, children }) {
  return (
    <div className="section">
      <h1 className="section-title">{title}</h1>
      {children}
    </div>
  );
}

function StudentCard({ student, courses, enrollments, onEdit }) {
  const studentCourses = enrollments
    .filter(e => e.student_id === student.id)
    .map(e => courses.find(c => c.id === e.course_id));

  return (
    <div className="student-card">
      <div className="student-info">
        <div className="student-id">ID: {student.id}</div>
        <h3>{student.name}</h3>
        <p className="student-email">{student.email}</p>
      </div>
      
      {studentCourses.length > 0 && (
        <div className="courses-list">
          <p className="courses-title">Курсы:</p>
          <ul>
            {studentCourses.map((c) => (
              <li key={c?.id}>{c?.title || "Неизвестный курс"}</li>
            ))}
          </ul>
        </div>
      )}

      <button 
        className="edit-button"
        onClick={() => onEdit(student)}
      >
        Редактировать
      </button>
    </div>
  );
}

function CourseCard({ course }) {
  return (
    <div className="course-card">
      <div className="course-id">ID: {course.id}</div>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
    </div>
  );
}

function EditForm({ student, onSave, onCancel }) {
  const [formData, setFormData] = useState(student);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form className="edit-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        className="form-input"
        placeholder="Имя"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        className="form-input"
        placeholder="Email"
        required
      />
      <div className="form-buttons">
        <button type="submit" className="save-button">
          Сохранить
        </button>
        <button type="button" onClick={onCancel} className="cancel-button">
          Отмена
        </button>
      </div>
    </form>
  );
}

function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <p>{message}</p>
    </div>
  );
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newStudent, setNewStudent] = useState({ name: "", email: "" });
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const [newEnrollment, setNewEnrollment] = useState({ 
    student_id: "", 
    course_id: "" 
  });
  
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
          fetch("http://localhost:8080/students"),
          fetch("http://localhost:8080/courses"),
          fetch("http://localhost:8080/enrollments")
        ]);

        if (!studentsRes.ok) throw new Error("Ошибка загрузки студентов");
        if (!coursesRes.ok) throw new Error("Ошибка загрузки курсов");
        if (!enrollmentsRes.ok) throw new Error("Ошибка загрузки записей");

        const studentsData = await studentsRes.json();
        const coursesData = await coursesRes.json();
        const enrollmentsData = await enrollmentsRes.json();

        setStudents(studentsData);
        setCourses(coursesData);
        setEnrollments(enrollmentsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateStudent = async (updatedStudent) => {
    try {
      const res = await fetch(`http://localhost:8080/students/${updatedStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent),
      });
      
      if (!res.ok) throw new Error("Ошибка обновления");
      
      setStudents(students.map(s => 
        s.id === updatedStudent.id ? updatedStudent : s
      ));
      setEditingStudent(null);
    } catch (error) {
      console.error(error);
    }
  };

  const addStudent = async () => {
    try {
      const res = await fetch("http://localhost:8080/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });

      if (!res.ok) throw new Error("Ошибка добавления");
      
      const data = await res.json();
      setStudents([...students, data]);
      setNewStudent({ name: "", email: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const addCourse = async () => {
    try {
      const res = await fetch("http://localhost:8080/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });

      if (!res.ok) throw new Error("Ошибка добавления");
      
      const data = await res.json();
      setCourses([...courses, data]);
      setNewCourse({ title: "", description: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const addEnrollment = async () => {
    try {
      const payload = {
        student_id: Number(newEnrollment.student_id),
        course_id: Number(newEnrollment.course_id)
      };

      const res = await fetch("http://localhost:8080/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Ошибка добавления");
      
      const data = await res.json();
      setEnrollments([...enrollments, data]);
      setNewEnrollment({ student_id: "", course_id: "" });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка данных...</div>;
  }

  if (error) {
    return <div className="error">🚨 Ошибка: {error}</div>;
  }

  return (
    <div className="app-container">
      <h1 className="app-header">Учебный портал</h1>

      <Section title="Студенты">
        <div className="students-grid">
          {students.length === 0 ? (
            <EmptyState message="Нет зарегистрированных студентов" />
          ) : (
            students.map(student => (
              editingStudent?.id === student.id ? (
                <EditForm
                  key={student.id}
                  student={student}
                  onSave={handleUpdateStudent}
                  onCancel={() => setEditingStudent(null)}
                />
              ) : (
                <StudentCard
                  key={student.id}
                  student={student}
                  courses={courses}
                  enrollments={enrollments}
                  onEdit={setEditingStudent}
                />
              )
            ))
          )}
        </div>

        <div className="add-form">
          <h2>Добавить студента</h2>
          <input
            type="text"
            placeholder="Имя"
            value={newStudent.name}
            onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
            className="form-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={newStudent.email}
            onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
            className="form-input"
          />
          <button 
            className="add-button"
            onClick={addStudent}
          >
            Добавить студента
          </button>
        </div>
      </Section>

      <Section title="Курсы">
        <div className="courses-grid">
          {courses.length === 0 ? (
            <EmptyState message="Нет доступных курсов" />
          ) : (
            courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))
          )}
        </div>

        <div className="add-form">
          <h2>Добавить курс</h2>
          <input
            type="text"
            placeholder="Название курса"
            value={newCourse.title}
            onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
            className="form-input"
          />
          <input
            type="text"
            placeholder="Описание курса"
            value={newCourse.description}
            onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
            className="form-input"
          />
          <button 
            className="add-button"
            onClick={addCourse}
          >
            Добавить курс
          </button>
        </div>
      </Section>

      <Section title="Записи на курсы">
        <div className="add-form">
          <h2>Новая запись</h2>
          <input
            type="number"
            placeholder="ID студента"
            value={newEnrollment.student_id}
            onChange={(e) => setNewEnrollment({
              ...newEnrollment,
              student_id: e.target.value.replace(/[^0-9]/g, "")
            })}
            className="form-input"
            min="1"
          />
          <input
            type="number"
            placeholder="ID курса"
            value={newEnrollment.course_id}
            onChange={(e) => setNewEnrollment({
              ...newEnrollment,
              course_id: e.target.value.replace(/[^0-9]/g, "")
            })}
            className="form-input"
            min="1"
          />
          <button 
            className="add-button"
            onClick={addEnrollment}
          >
            Записать на курс
          </button>
        </div>

        <div className="enrollments-list">
          {enrollments.length === 0 ? (
            <EmptyState message="Нет активных записей" />
          ) : (
            enrollments.map(e => {
              const student = students.find(s => s.id === e.student_id);
              const course = courses.find(c => c.id === e.course_id);
              return (
                <div key={e.id} className="enrollment-item">
                  <span className="enrollment-student">
                    {student?.name || "Неизвестный студент"} (ID: {e.student_id})
                  </span>
                  <span className="enrollment-arrow">→</span>
                  <span className="enrollment-course">
                    {course?.title || "Неизвестный курс"} (ID: {e.course_id})
                  </span>
                  <span className="enrollment-date">
                    {new Date(e.enrolled_at).toLocaleDateString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Section>
    </div>
  );
}