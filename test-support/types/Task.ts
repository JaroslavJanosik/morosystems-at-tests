/**
 * Interface representing a Task in the ToDo Tasks API.
 */
export interface Task {
    id: string;
    text: string;
    completed: boolean;
    createdDate: number;
    completedDate?: number;
}