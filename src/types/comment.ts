export type CommentSort = 'new' | 'top';
export type CommentVoteValue = -1 | 0 | 1;

export type AnimeCommentUser = {
   id: number;
   name: string;
   avatar_path?: string | null;
   avatar_url?: string | null;
};

export type AnimeCommentReplyTarget = {
   id: number;
   name: string;
};

export type AnimeCommentItem = {
   id: number;
   anime_id: number;
   parent_id: number | null;
   reply_to_user: AnimeCommentReplyTarget | null;
   body: string | null;
   has_spoiler: boolean;
   is_deleted: boolean;
   is_edited: boolean;
   edited_at: string | null;
   created_at: string | null;
   likes_count: number;
   dislikes_count: number;
   replies_count: number;
   my_vote: CommentVoteValue;
   can_edit: boolean;
   can_delete: boolean;
   user: AnimeCommentUser;
   replies: AnimeCommentItem[];
};

export type CommentPagination = {
   current_page: number;
   last_page: number;
   per_page: number;
   total: number;
   has_more: boolean;
};

export type CommentsListData = {
   items: AnimeCommentItem[];
   pagination: CommentPagination;
   sort: CommentSort;
};

export type CommentsListResponse = {
   message: string;
   data: CommentsListData | null;
   errors: unknown;
};

export type CommentMutationResponse = {
   message: string;
   data: {
      item: AnimeCommentItem;
   } | null;
   errors: unknown;
}