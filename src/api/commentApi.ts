import { CommentMutationResponse, CommentsListResponse, CommentSort, CommentVoteValue } from "@/types/comment";
import api from "@/api/axios";

type FetchCommentsParams = {
   slug: string;
   page?: number;
   perPage?: number;
   sort?: CommentSort;
};

type CreateCommentPayload = {
   body: string;
   has_spoiler?: boolean;
   parent_id?: number | null;
   reply_to_user_id?: number | null;
};

export async function fetchAnimeComments({slug, page = 1, perPage = 10, sort = 'new',}: FetchCommentsParams): Promise<CommentsListResponse>{
   const {data} = await api.get<CommentsListResponse>(`/anime/${slug}/comments`, {
      params: {
         page, 
         per_page: perPage,
         sort,
      },
   });

   return data;
}

export async function createAnimeComment(animeId: number, payload: CreateCommentPayload,): Promise<CommentMutationResponse>{
   const {data} = await api.post<CommentMutationResponse>(`/anime/${animeId}/comments`, payload);
   return data;
}

export async function voteAnimeComment(commentId: number, vote: CommentVoteValue,): Promise<CommentMutationResponse>{
   const {data} = await api.post<CommentMutationResponse>(`/comments/${commentId}/vote`, {vote,});
   return data;
}