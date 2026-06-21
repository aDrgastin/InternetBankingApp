export default interface PagedResponse {
    status: string;
    data: any[];
    pagination: {
        page: number,
        total: number,
        totalPages: number
    };
}
