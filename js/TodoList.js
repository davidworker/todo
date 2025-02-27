import { Todo } from './Todo.js'

class TodoList {
    constructor(cloud) {
        this.cloud = cloud
        this.onTodosUpdated = null
    }

    // 設定更新回調函數
    setUpdateCallback(callback) {
        this.onTodosUpdated = callback
    }

    // 與雲端同步資料
    async syncWithCloud() {
        if (!this.cloud.checkApi()) {
            console.log('API 未設定，無法同步')
            return null
        }

        try {
            // 從雲端獲取資料
            const cloudTodos = await this.cloud.fetchTodos()

            // 將雲端資料轉換為 Todo 物件
            const todos = cloudTodos.map((todoData) => Todo.fromJSON(todoData))

            // 更新本地儲存
            localStorage.setItem('todos', JSON.stringify(todos))

            // 觸發更新事件
            if (this.onTodosUpdated) {
                this.onTodosUpdated(todos)
            }

            return todos
        } catch (error) {
            console.error('同步失敗:', error)
            throw new Error('同步失敗')
        }
    }

    // 儲存到雲端
    async saveToCloud(todos) {
        if (!this.cloud.checkApi()) {
            console.log('API 未設定，無法儲存')
            return false
        }

        try {
            // 將 Todo 物件轉換為純資料
            const todoData = todos.map((todo) => todo.toJSON())

            // 儲存到雲端
            return await this.cloud.saveTodos(todoData)
        } catch (error) {
            console.error('儲存失敗:', error)
            return false
        }
    }
}

export { TodoList }
