// contact-service.js
class ContactService {
    constructor() {
        this.API_BASE = 'http://localhost:3001';
    }

    // Submit contact form
    async submitContactForm(contactData) {
        try {
            const response = await fetch(`${this.API_BASE}/contacts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...contactData,
                    submittedAt: new Date().toISOString(),
                    status: 'new'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit contact form');
            }

            return await response.json();
        } catch (error) {
            console.error('Contact submission error:', error);
            throw error;
        }
    }

    // Get all contacts (admin function)
    async getAllContacts() {
        try {
            const response = await fetch(`${this.API_BASE}/contacts`);
            if (!response.ok) {
                throw new Error('Failed to fetch contacts');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching contacts:', error);
            return [];
        }
    }

    // Update contact status
    async updateContactStatus(contactId, status) {
        try {
            const response = await fetch(`${this.API_BASE}/contacts/${contactId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            return response.ok;
        } catch (error) {
            console.error('Error updating contact status:', error);
            return false;
        }
    }

    // Get contact statistics
    async getContactStats() {
        try {
            const contacts = await this.getAllContacts();
            return {
                total: contacts.length,
                new: contacts.filter(c => c.status === 'new').length,
                inProgress: contacts.filter(c => c.status === 'in_progress').length,
                resolved: contacts.filter(c => c.status === 'resolved').length
            };
        } catch (error) {
            console.error('Error getting contact stats:', error);
            return null;
        }
    }

    // Search contacts
    async searchContacts(query) {
        try {
            const contacts = await this.getAllContacts();
            return contacts.filter(contact =>
                contact.name.toLowerCase().includes(query.toLowerCase()) ||
                contact.email.toLowerCase().includes(query.toLowerCase()) ||
                contact.subject.toLowerCase().includes(query.toLowerCase())
            );
        } catch (error) {
            console.error('Error searching contacts:', error);
            return [];
        }
    }
}

// Create global instance
const contactService = new ContactService();