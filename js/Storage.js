import { Todo } from './Todo.js'
import { Cloud } from './Cloud.js'

class Storage {
    constructor(key = 'todos') {
        this.key = key
        this.cloud = new Cloud()
        this.initialized = false

        // 檢查是否已有儲存的 uid
        const savedUid = localStorage.getItem('todo_uid')
        if (savedUid) {
            this.cloud.setUserId(savedUid)
            this.syncWithCloud()
        } else {
            this.promptForUserId()
        }
    }

    async promptForUserId() {
        try {
            const result = await window.Swal.fire({
                title: '請輸入使用者 ID',
                input: 'text',
                inputLabel: '這是必填欄位',
                inputPlaceholder: '請輸入您的使用者 ID',
                allowOutsideClick: false,
                allowEscapeKey: false,
                confirmButtonText: '確認',
                showCancelButton: false,
                inputValidator: (value) => {
                    if (!value) {
                        return '使用者 ID 不能為空！'
                    }
                },
            })

            if (result.isConfirmed && result.value) {
                localStorage.setItem('todo_uid', result.value)
                this.cloud.setUserId(result.value)
                if (!this.initialized) {
                    this.initialized = true
                    await this.syncWithCloud()
                }
            }
        } catch (error) {
            console.error('輸入使用者 ID 時發生錯誤:', error)
            // 如果發生錯誤，稍後重試
            setTimeout(() => this.promptForUserId(), 1000)
        }
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
            // 如果是因為沒有 uid 造成的錯誤，重新提示輸入
            if (error.message.includes('使用者 ID')) {
                await this.promptForUserId()
            }
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
            // 如果是因為沒有 uid 造成的錯誤，重新提示輸入
            if (error.message.includes('使用者 ID')) {
                await this.promptForUserId()
            }
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

    async setUserId(uid) {
        if (uid) {
            localStorage.setItem('todo_uid', uid)
            this.cloud.setUserId(uid)
            await this.syncWithCloud()
        } else {
            await this.promptForUserId()
        }
    }
}

export { Storage }
