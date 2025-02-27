class Cloud {
    constructor(uid = '1') {
        this.uid = uid
        this.apiBaseUrl = 'https://book.niceinfos.com/frontend/api/'
    }

    // 從雲端獲取待辦事項
    async fetchTodos() {
        try {
            const response = await fetch(`${this.apiBaseUrl}?action=todo&uid=${this.uid}`)
            const result = await response.json()

            if (result.code === 200) {
                return result.data || []
            } else {
                console.error('獲取雲端資料失敗:', result)
                return []
            }
        } catch (error) {
            console.error('雲端連線錯誤:', error)
            return []
        }
    }

    // 將資料儲存到雲端
    async saveTodos(todos) {
        try {
            const response = await fetch(this.apiBaseUrl, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'todo',
                    data: todos,
                    uid: this.uid,
                }),
            })

            const result = await response.json()

            if (result.code !== 200) {
                throw new Error('儲存失敗')
            }

            return true
        } catch (error) {
            console.error('雲端儲存錯誤:', error)
            return false
        }
    }

    // 設置使用者 ID
    setUserId(uid) {
        this.uid = uid
    }
}

export { Cloud }
