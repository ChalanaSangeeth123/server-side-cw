const db = require('../config/database');
const { AuthMiddleware, ValidationMiddleware } = require('../middleware');

class UserDAO {
  async getAllUsers() {
    const [rows] = await db.query('SELECT * FROM users'); // Ensure this matches your table name
    return rows;
  }

  async getUserById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
}
    async createUser(user) {
        const { name, email, password } = user;
        const hashedPassword = await AuthMiddleware.hashPassword(password);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        return result.insertId;
  }

  async updateUser(id, user) {
    const { name, email, password } = user;
    await db.query('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [name, email, password, id]);
  }

  async deleteUser(id) {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
  }
}

module.exports = new UserDAO();
