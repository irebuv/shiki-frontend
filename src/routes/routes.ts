export const routes = {
    adminAnime: {
        index: () => `/admin/anime`,
        delete: (id: number) => `/admin/anime/${id}`,
        edit: (id: number) => `/admin/anime/${id}/edit`,
    }
}