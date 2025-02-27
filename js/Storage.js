import { Todo } from './Todo.js'
import { Cloud } from './Cloud.js'

class Storage {
    constructor(todoList = null) {
        this.todoList = todoList
        this.key = 'todos'
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

        this.loadTodos()
    }

    async promptForUserId(isChanging = false) {
        try {
            const result = await window.Swal.fire({
                title: isChanging ? '更換使用者 ID' : '請輸入使用者 ID',
                input: 'text',
                inputLabel: '這是必填欄位',
                inputPlaceholder: '請輸入您的使用者 ID',
                allowOutsideClick: false,
                allowEscapeKey: false,
                confirmButtonText: '確認',
                showCancelButton: isChanging,
                cancelButtonText: '取消',
                inputValidator: (value) => {
                    if (!value) {
                        return '使用者 ID 不能為空！'
                    }
                },
            })

            if (result.isConfirmed && result.value) {
                if (isChanging) {
                    // 清空本地資料
                    localStorage.removeItem(this.key)
                }
                localStorage.setItem('todo_uid', result.value)
                this.cloud.setUserId(result.value)
                if (!this.initialized || isChanging) {
                    this.initialized = true
                    await this.syncWithCloud()
                }

                if (isChanging) {
                    await window.Swal.fire({
                        icon: 'success',
                        title: '更換成功',
                        text: '已成功更換使用者 ID 並同步雲端資料',
                        timer: 1500,
                    })
                }
            }
        } catch (error) {
            console.error('輸入使用者 ID 時發生錯誤:', error)
            // 如果發生錯誤，稍後重試
            setTimeout(() => this.promptForUserId(isChanging), 1000)
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

    loadTodos() {
        const todosJson = localStorage.getItem(this.key)
        this.todos = todosJson ? JSON.parse(todosJson).map((todo) => Todo.fromJSON(todo)) : []
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

    getTodos() {
        return this.todos
    }

    async addTodo(text) {
        const todo = new Todo(text)
        this.todos.push(todo)
        await this.saveTodos(this.todos)
        return todo
    }

    async deleteTodo(id) {
        this.todos = this.todos.filter((todo) => todo.id !== id)
        await this.saveTodos(this.todos)
    }

    async toggleTodo(id) {
        const todo = this.todos.find((todo) => todo.id === id)
        if (todo) {
            todo.toggle()
            await this.saveTodos(this.todos)
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

    async changeUserId() {
        await this.promptForUserId(true)
    }

    setTodos(todos) {
        this.todos = todos
        this.saveTodos(todos)
    }

    setTodoList(todoList) {
        this.todoList = todoList
    }
}

export { Storage }
