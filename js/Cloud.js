class Cloud {
    constructor(uid = null) {
        this.uid = uid
        this.apiBaseUrl = 'https://book.niceinfos.com/frontend/api/'
    }

    // 檢查是否有設置 uid
    checkUid() {
        if (!this.uid) {
            throw new Error('需要設置使用者 ID')
        }
    }

    // 從雲端獲取待辦事項
    async fetchTodos() {
        try {
            this.checkUid()
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
            this.checkUid()
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
        if (!uid) {
            throw new Error('使用者 ID 不能為空')
        }
        this.uid = uid
    }
}

export { Cloud }
