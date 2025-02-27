import { Storage } from './Storage.js'

document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todoInput')
    const addTodoBtn = document.getElementById('addTodo')
    const activeTodoList = document.getElementById('activeTodoList')
    const completedTodoList = document.getElementById('completedTodoList')

    const storage = new Storage()

    // 創建待辦事項元素
    const createTodoElement = (todo) => {
        const li = document.createElement('li')
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`

        const textSpan = document.createElement('span')
        textSpan.textContent = todo.text

        const deleteBtn = document.createElement('button')
        deleteBtn.className = 'delete-btn'
        deleteBtn.textContent = '刪除'

        li.appendChild(textSpan)
        li.appendChild(deleteBtn)

        // 點擊待辦事項切換完成狀態
        li.addEventListener('click', async (e) => {
            if (e.target !== deleteBtn) {
                await storage.toggleTodo(todo.id)
                renderTodos()
            }
        })

        // 刪除待辦事項
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation()
            await storage.deleteTodo(todo.id)
            renderTodos()
        })

        return li
    }

    // 渲染待辦事項列表
    const renderTodos = () => {
        activeTodoList.innerHTML = ''
        completedTodoList.innerHTML = ''

        const todos = storage.getTodos()

        todos.forEach((todo) => {
            const todoElement = createTodoElement(todo)
            if (todo.completed) {
                completedTodoList.appendChild(todoElement)
            } else {
                activeTodoList.appendChild(todoElement)
            }
        })
    }

    // 添加新的待辦事項
    const addTodo = async () => {
        const text = todoInput.value.trim()
        if (text) {
            await storage.addTodo(text)
            todoInput.value = ''
            renderTodos()
        }
    }

    // 事件監聽器
    addTodoBtn.addEventListener('click', addTodo)
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo()
        }
    })

    // 設置用戶 ID（可以根據需要修改）
    const setUserId = (uid) => {
        storage.setUserId(uid)
    }

    // 初始渲染
    renderTodos()

    // 暴露設置用戶 ID 的方法到全局作用域
    window.setUserId = setUserId
})
