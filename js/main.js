import { Storage } from './Storage.js'
import { Cloud } from './Cloud.js'
import { TodoList } from './TodoList.js'

document.addEventListener('DOMContentLoaded', async () => {
    const todoInput = document.getElementById('todoInput')
    const addTodoBtn = document.getElementById('addTodo')
    const activeTodoList = document.getElementById('activeTodoList')
    const completedTodoList = document.getElementById('completedTodoList')
    const changeUidBtn = document.getElementById('changeUid')

    // 初始化各個類別
    const cloud = new Cloud()
    const todoList = new TodoList(cloud)
    const storage = new Storage(todoList)

    // 等待 storage 初始化完成
    await storage.initialize()

    // 設定 TodoList 的更新回調
    todoList.setUpdateCallback((todos) => {
        storage.setTodos(todos)
        renderTodos()
    })

    // API 設定相關元素
    const configApiBtn = document.getElementById('configApi')
    const apiStatusText = document.getElementById('apiStatusText')
    const currentUser = document.getElementById('currentUser')
    const apiUrl = document.getElementById('apiUrl')

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

    // 更換使用者 ID
    changeUidBtn.addEventListener('click', async () => {
        await storage.changeUserId()
        renderTodos()
    })

    // 更新 API 狀態顯示
    function updateApiStatus() {
        // 更新使用者資訊
        const savedUid = localStorage.getItem('todo_uid')
        currentUser.textContent = savedUid || '未設定'

        // 更新 API 資訊
        const savedApiUrl = localStorage.getItem('todo_api_url')
        apiUrl.textContent = savedApiUrl || '未設定'

        if (cloud.checkApi()) {
            apiStatusText.textContent = '已連接'
            apiStatusText.classList.add('connected')
        } else {
            apiStatusText.textContent = '未設定'
            apiStatusText.classList.remove('connected')
        }
    }

    // 設定 API
    configApiBtn.addEventListener('click', async () => {
        const { value: url, isDismissed } = await window.Swal.fire({
            title: '設定 API 位置',
            input: 'url',
            inputLabel: '請輸入 API 位置',
            inputPlaceholder: 'https://example.com/api/todo/',
            inputValue: localStorage.getItem('todo_api_url') || '',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: '確認',
            denyButtonText: '清除設定',
            cancelButtonText: '取消',
            inputValidator: (value) => {
                if (value) {
                    try {
                        const url = new URL(value)
                        if (!url.protocol.startsWith('http')) {
                            return '請使用 HTTP 或 HTTPS 協議'
                        }
                    } catch (e) {
                        return '請輸入有效的 URL'
                    }
                }
            },
        })

        try {
            if (isDismissed) {
                return
            }

            cloud.setApiUrl(url)
            updateApiStatus()

            if (url) {
                // 檢查是否已設定使用者 ID
                const savedUid = localStorage.getItem('todo_uid')
                if (!savedUid) {
                    await storage.promptForUserId()
                }

                // 確保使用者 ID 已設定後再同步
                if (localStorage.getItem('todo_uid')) {
                    const syncedTodos = await todoList.syncWithCloud()
                    if (syncedTodos) {
                        storage.setTodos(syncedTodos) // 更新 Storage 中的資料
                        renderTodos() // 重新渲染畫面
                    }
                    await window.Swal.fire({
                        icon: 'success',
                        title: '成功',
                        text: 'API 設定已更新並同步完成',
                    })
                }
            } else {
                // 清除 API 設定
                cloud.setApiUrl(null)
                storage.clearCloudSync()
                renderTodos()
                await window.Swal.fire({
                    icon: 'info',
                    title: '已清除設定',
                    text: 'API 設定已清除，將使用本地儲存',
                })
            }
        } catch (error) {
            await window.Swal.fire('錯誤', error.message, 'error')
        }
    })

    // 初始化 API 狀態顯示
    updateApiStatus()

    // 初始渲染
    renderTodos()
})
