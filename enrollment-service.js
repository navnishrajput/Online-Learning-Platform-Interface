// enrollment-service.js - Add this to your project

const API_BASE = 'http://localhost:3001';

// Enrollment Service Class
class EnrollmentService {
    constructor() {
        this.currentUser = this.getCurrentUser();
    }

    // Get current user from localStorage
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Get all courses
    async getAllCourses() {
        try {
            const response = await fetch(`${API_BASE}/courses`);
            if (!response.ok) throw new Error('Failed to fetch courses');
            return await response.json();
        } catch (error) {
            console.error('Error fetching courses:', error);
            return [];
        }
    }

    // Get course by ID
    async getCourseById(courseId) {
        try {
            const response = await fetch(`${API_BASE}/courses/${courseId}`);
            if (!response.ok) throw new Error('Course not found');
            return await response.json();
        } catch (error) {
            console.error('Error fetching course:', error);
            return null;
        }
    }

    // Get course by title
    async getCourseByTitle(courseTitle) {
        try {
            const response = await fetch(`${API_BASE}/courses?title=${encodeURIComponent(courseTitle)}`);
            if (!response.ok) throw new Error('Failed to fetch course');
            const courses = await response.json();
            return courses[0] || null;
        } catch (error) {
            console.error('Error fetching course by title:', error);
            return null;
        }
    }

    // Get user enrollments
    async getUserEnrollments(userId = null) {
        try {
            const uid = userId || (this.currentUser ? this.currentUser.id : null);
            if (!uid) return [];
            
            const response = await fetch(`${API_BASE}/enrollments?userId=${uid}`);
            if (!response.ok) throw new Error('Failed to fetch enrollments');
            return await response.json();
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            return [];
        }
    }

    // Check if user is enrolled in a course
    async isEnrolled(courseId) {
        if (!this.currentUser) return false;
        
        try {
            const response = await fetch(
                `${API_BASE}/enrollments?userId=${this.currentUser.id}&courseId=${courseId}`
            );
            if (!response.ok) return false;
            
            const enrollments = await response.json();
            return enrollments.length > 0;
        } catch (error) {
            console.error('Error checking enrollment:', error);
            return false;
        }
    }

    // Enroll in a course
    async enrollInCourse(courseId, courseTitle = '') {
        if (!this.currentUser) {
            throw new Error('User must be logged in to enroll');
        }

        try {
            // Check if already enrolled
            const isAlreadyEnrolled = await this.isEnrolled(courseId);
            if (isAlreadyEnrolled) {
                throw new Error('Already enrolled in this course');
            }

            // Get course details if title not provided
            let courseTitleToUse = courseTitle;
            if (!courseTitleToUse) {
                const course = await this.getCourseById(courseId);
                if (!course) throw new Error('Course not found');
                courseTitleToUse = course.title;
            }

            // Create enrollment
            const enrollment = {
                userId: this.currentUser.id,
                courseId: courseId,
                courseTitle: courseTitleToUse,
                enrolledAt: new Date().toISOString(),
                progress: 0,
                status: 'In Progress'
            };

            const response = await fetch(`${API_BASE}/enrollments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(enrollment)
            });

            if (!response.ok) {
                throw new Error('Failed to enroll in course');
            }

            return await response.json();
            
        } catch (error) {
            console.error('Enrollment error:', error);
            throw error;
        }
    }

    // Update course progress
    async updateProgress(enrollmentId, progress) {
        try {
            const response = await fetch(`${API_BASE}/enrollments/${enrollmentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    progress: Math.min(100, Math.max(0, progress)),
                    status: progress >= 100 ? 'Completed' : 'In Progress'
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Error updating progress:', error);
            return false;
        }
    }

    // Get enrollment statistics
    async getEnrollmentStats() {
        try {
            const enrollments = await this.getUserEnrollments();
            return {
                totalCourses: enrollments.length,
                completedCourses: enrollments.filter(e => e.progress === 100).length,
                inProgressCourses: enrollments.filter(e => e.progress < 100 && e.progress > 0).length,
                notStartedCourses: enrollments.filter(e => e.progress === 0).length,
                averageProgress: enrollments.length > 0 
                    ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length 
                    : 0
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return null;
        }
    }

    // Get recent enrollments
    async getRecentEnrollments(limit = 5) {
        try {
            const enrollments = await this.getUserEnrollments();
            return enrollments
                .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
                .slice(0, limit);
        } catch (error) {
            console.error('Error getting recent enrollments:', error);
            return [];
        }
    }
}

// Create global instance
const enrollmentService = new EnrollmentService();