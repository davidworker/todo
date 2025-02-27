class Cloud {
    constructor(uid = null, apiBaseUrl = null) {
        this.uid = uid
        this.apiBaseUrl = apiBaseUrl
    }

    // 檢查是否有設置 uid
    checkUid() {
        if (!this.uid) {
            throw new Error('需要設置使用者 ID')
        }
    }

    // 檢查是否有設置 API
    checkApi() {
        if (!this.apiBaseUrl) {
            return false
        }
        return true
    }

    // 從雲端獲取待辦事項
    async fetchTodos() {
        try {
            if (!this.checkApi()) {
                console.log('API 未設定，略過雲端同步')
                return []
            }
            this.checkUid()
            const response = await fetch(`${this.apiBaseUrl}?uid=${this.uid}`)
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
            if (!this.checkApi()) {
                console.log('API 未設定，略過雲端儲存')
                return false
            }
            this.checkUid()
            const response = await fetch(this.apiBaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: this.uid,
                    data: todos,
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

    // 設置 API 位置
    setApiUrl(url) {
        if (!url) {
            throw new Error('API 位置不能為空')
        }
        this.apiBaseUrl = url
    }
}

export { Cloud }
