import { Todo } from './Todo.js'
import { Cloud } from './Cloud.js'

class Storage {
    constructor(key = 'todos') {
        this.key = key
        this.cloud = new Cloud()
        this.syncWithCloud()
    }

    async syncWithCloud() {
        try {
            const cloudTodos = await this.cloud.fetchTodos()
            if (cloudTodos.length > 0) {
                // 如果雲端有資料，更新本地存儲
                this.saveTodos(cloudTodos.map((item) => Todo.fromJSON(item)))
            } else {
                // 如果雲端沒有資料，上傳本地資料
                const localTodos = this.getTodos()
                if (localTodos.length > 0) {
                    await this.cloud.saveTodos(localTodos.map((todo) => todo.toJSON()))
                }
            }
        } catch (error) {
            console.error('同步失敗:', error)
        }
    }

    getTodos() {
        const items = localStorage.getItem(this.key)
        if (!items) return []

        try {
            const parsedItems = JSON.parse(items)
            return parsedItems.map((item) => Todo.fromJSON(item))
        } catch (error) {
            console.error('Error parsing todos:', error)
            return []
        }
    }

    async saveTodos(todos) {
        try {
            const data = todos.map((todo) => todo.toJSON())
            localStorage.setItem(this.key, JSON.stringify(data))
            await this.cloud.saveTodos(data)
        } catch (error) {
            console.error('Error saving todos:', error)
        }
    }

    async addTodo(text) {
        const todos = this.getTodos()
        const newTodo = new Todo(text)
        todos.push(newTodo)
        await this.saveTodos(todos)
        return newTodo
    }

    async deleteTodo(id) {
        const todos = this.getTodos()
        const filteredTodos = todos.filter((todo) => todo.id !== id)
        await this.saveTodos(filteredTodos)
    }

    async toggleTodo(id) {
        const todos = this.getTodos()
        const todo = todos.find((todo) => todo.id === id)
        if (todo) {
            todo.toggle()
            await this.saveTodos(todos)
        }
    }

    setUserId(uid) {
        this.cloud.setUserId(uid)
        this.syncWithCloud()
    }
}

export { Storage }
