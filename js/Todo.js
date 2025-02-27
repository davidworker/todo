class Todo {
    constructor(text, completed = false) {
        this.text = text
        this.completed = completed
        this.id = Date.now().toString()
    }

    toggle() {
        this.completed = !this.completed
    }

    toJSON() {
        return {
            id: this.id,
            text: this.text,
            completed: this.completed,
        }
    }

    static fromJSON(json) {
        const todo = new Todo(json.text, json.completed)
        todo.id = json.id
        return todo
    }
}

export { Todo }
