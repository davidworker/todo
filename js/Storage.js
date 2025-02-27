import { Todo } from './Todo.js'
import { Cloud } from './Cloud.js'

class Storage {
    constructor(todoList = null) {
        this.todoList = todoList
        this.key = 'todos'
        this.cloud = new Cloud()
        this.initialized = false
        this.todos = []
    }

    // 初始化方法
    async initialize() {
        // 檢查是否已有儲存的 uid
        const savedUid = localStorage.getItem('todo_uid')
        if (savedUid) {
            this.cloud.setUserId(savedUid)
            // 如果有設定 API，優先從雲端同步資料
            if (this.cloud.checkApi()) {
                await this.syncWithCloud()
            } else {
                this.loadTodos()
            }
        } else {
            await this.promptForUserId()
            this.loadTodos()
        }
        this.initialized = true
        return this
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
                // 設定新的使用者 ID
                localStorage.setItem('todo_uid', result.value)
                this.cloud.setUserId(result.value)

                if (isChanging) {
                    // 如果有設定 API，等待同步完成
                    if (!this.cloud.checkApi()) {
                        this.todos = []
                        localStorage.removeItem(this.key)
                    }

                    await window.Swal.fire({
                        icon: 'success',
                        title: '更換成功',
                        text: '已成功更換使用者 ID，頁面將重新整理',
                        timer: 1800,
                    })
                    // 重新整理頁面
                    window.location.reload()
                } else {
                    // 如果有設定 API，立即從雲端同步資料
                    if (this.cloud.checkApi()) {
                        const cloudTodos = await this.cloud.fetchTodos()
                        if (cloudTodos.length > 0) {
                            this.todos = cloudTodos.map((item) => Todo.fromJSON(item))
                            await this.saveTodos(this.todos)
                        }
                    } else {
                        // 如果沒有設定 API，確保本地資料為空
                        this.todos = []
                        localStorage.removeItem(this.key)
                    }

                    // 觸發 TodoList 的更新事件
                    if (this.todoList) {
                        this.todoList.onTodosUpdated?.(this.todos)
                    }
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
                this.todos = cloudTodos.map((item) => Todo.fromJSON(item))
                // 更新本地儲存
                localStorage.setItem(this.key, JSON.stringify(cloudTodos))
                // 觸發更新事件
                if (this.todoList) {
                    this.todoList.onTodosUpdated?.(this.todos)
                }
            } else {
                // 如果雲端沒有資料，清空本地資料
                this.todos = []
                localStorage.removeItem(this.key)
                // 觸發更新事件
                if (this.todoList) {
                    this.todoList.onTodosUpdated?.(this.todos)
                }
            }
        } catch (error) {
            console.error('同步失敗:', error)
            // 如果是因為沒有 uid 造成的錯誤，重新提示輸入
            if (error.message.includes('使用者 ID')) {
                await this.promptForUserId()
            } else {
                // 其他錯誤，載入本地資料
                this.loadTodos()
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

            // 只有在有設定 API 時才嘗試雲端儲存
            if (this.cloud.checkApi()) {
                await this.cloud.saveTodos(data)
            }
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

    // 清除雲端同步設定
    clearCloudSync() {
        // 重新初始化 cloud 實例
        this.cloud = new Cloud()
        // 如果有已存在的 uid，重新設定
        const savedUid = localStorage.getItem('todo_uid')
        if (savedUid) {
            this.cloud.setUserId(savedUid)
        }
    }
}

export { Storage }
