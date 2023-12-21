export type Message = {
    role: "user" | "assistant"
    content: string
    source?: {
        pageNumber: number,
        link: string,
    }
}