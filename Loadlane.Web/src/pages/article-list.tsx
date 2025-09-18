import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Package, Plus, Loader2, Edit, MoreHorizontal, Trash2, AlertCircle, Scale, Box } from "lucide-react";
import { useArticles } from "../hooks/useArticle";
import { ArticleFormDialog } from "../components/forms/article-form-dialog";
import { ConfirmationDialog } from "../components/ui/confirmation-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import type { ArticleResponse, CreateArticleRequest, UpdateArticleRequest } from "../types/article";

export function ArticleListPage() {
    const { articles, loading, error, refetch, createArticle, updateArticle, deleteArticle } = useArticles();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<ArticleResponse | null>(null);
    const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null);
    const [articleToDelete, setArticleToDelete] = useState<ArticleResponse | null>(null);

    const handleCreateArticle = async (data: CreateArticleRequest) => {
        await createArticle(data);
    };

    const handleUpdateArticle = async (data: UpdateArticleRequest) => {
        if (editingArticle) {
            await updateArticle(editingArticle.id, data);
            setEditingArticle(null);
        }
    };

    const handleDeleteArticleClick = (article: ArticleResponse) => {
        setDeleteArticleId(article.id);
        setArticleToDelete(article);
    };

    const handleConfirmDeleteArticle = async () => {
        if (deleteArticleId) {
            await deleteArticle(deleteArticleId);
            setDeleteArticleId(null);
            setArticleToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading articles...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                        <h2 className="text-lg font-semibold mb-2">Error Loading Articles</h2>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={refetch}>Try Again</Button>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Article Management</h1>
                        <p className="text-muted-foreground">
                            Manage your article catalog for transport orders.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Article
                    </Button>
                </div>
            </div>

            {articles.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Articles Found</h3>
                    <p className="text-muted-foreground mb-4">
                        Get started by adding your first article.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Article
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-fr">
                    {articles.map((article) => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            onEdit={setEditingArticle}
                            onDelete={handleDeleteArticleClick}
                            formatDate={formatDate}
                        />
                    ))}
                </div>
            )}

            <ArticleFormDialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSubmit={handleCreateArticle}
                mode="create"
            />

            <ArticleFormDialog
                open={!!editingArticle}
                onClose={() => setEditingArticle(null)}
                onSubmit={handleUpdateArticle}
                article={editingArticle || undefined}
                mode="edit"
            />

            <ConfirmationDialog
                open={!!deleteArticleId}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteArticleId(null);
                        setArticleToDelete(null);
                    }
                }}
                title="Delete Article"
                description={`Are you sure you want to delete article "${articleToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleConfirmDeleteArticle}
            />
        </div>
    );
}

interface ArticleCardProps {
    article: ArticleResponse;
    onEdit: (article: ArticleResponse) => void;
    onDelete: (article: ArticleResponse) => void;
    formatDate: (dateString: string) => string;
}

function ArticleCard({ article, onEdit, onDelete, formatDate }: ArticleCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow w-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg truncate">{article.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(article)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(article)}
                                className="text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {article.description && (
                    <div className="text-sm text-muted-foreground">
                        <p className="line-clamp-3">{article.description}</p>
                    </div>
                )}

                {(article.weight || article.volume) && (
                    <div className="flex items-center space-x-4 text-sm">
                        {article.weight && (
                            <div className="flex items-center space-x-1">
                                <Scale className="h-4 w-4 text-muted-foreground" />
                                <span>{article.weight} kg</span>
                            </div>
                        )}
                        {article.volume && (
                            <div className="flex items-center space-x-1">
                                <Box className="h-4 w-4 text-muted-foreground" />
                                <span>{article.volume} m³</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                    <Badge variant="outline" className="text-xs">
                        Available
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        Added {formatDate(article.createdUtc)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}