// FarmConnect Agricultural Community & Peer Discussions Screen (Phase 22)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { colors } from '../../theme';
import { Header, Card, Button, Badge, EmptyState } from '../../components/common';
import apiClient from '../../services/apiClient';

export default function CommunityScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [posting, setPosting] = useState(false);

  // Comments modal state
  const [activePost, setActivePost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/community/posts');
      if (res.data?.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.error('fetchFeed error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleLike = async (postId) => {
    try {
      const res = await apiClient.post(`/community/posts/${postId}/like`);
      if (res.data?.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likes_count: res.data.likes_count } : p))
        );
      }
    } catch (err) {
      console.error('handleLike error:', err);
    }
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      setPosting(true);
      const res = await apiClient.post('/community/posts', {
        title: newTitle,
        content: newContent,
      });
      if (res.data?.success) {
        setNewTitle('');
        setNewContent('');
        setModalVisible(false);
        fetchFeed();
      }
    } catch (err) {
      console.error('createPost error:', err);
    } finally {
      setPosting(false);
    }
  };

  const openComments = async (post) => {
    setActivePost(post);
    try {
      const res = await apiClient.get(`/community/posts/${post.id}`);
      if (res.data?.success) {
        setComments(res.data.comments || []);
      }
    } catch (err) {
      console.error('openComments error:', err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !activePost) return;
    try {
      setCommenting(true);
      const res = await apiClient.post(`/community/posts/${activePost.id}/comment`, {
        content: commentText.trim(),
      });
      if (res.data?.success) {
        setComments((prev) => [
          ...prev,
          {
            id: res.data.comment_id,
            author_name: 'You',
            content: commentText.trim(),
            created_at: new Date().toISOString(),
          },
        ]);
        setCommentText('');
        setPosts((prev) =>
          prev.map((p) =>
            p.id === activePost.id ? { ...p, comments_count: res.data.comments_count } : p
          )
        );
      }
    } catch (err) {
      console.error('addComment error:', err);
    } finally {
      setCommenting(false);
    }
  };

  const renderPost = ({ item }) => (
    <Card style={styles.postCard}>
      <View style={styles.authorRow}>
        <View style={styles.authorAvatar}>
          <Text style={{ fontSize: 16 }}>🧑‍🌾</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.authorName}>{item.author_name}</Text>
          <Text style={styles.authorLocation}>
            {item.district || 'Mandya'}, {item.state || 'Karnataka'} • {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <Badge label={item.author_role} variant="neutral" />
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent}>{item.content}</Text>

      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.postImg} resizeMode="cover" />
      ) : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id)}>
          <Text style={styles.actionIcon}>👍</Text>
          <Text style={styles.actionTxt}>{item.likes_count || 0} Helpful</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => openComments(item)}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionTxt}>{item.comments_count || 0} Replies</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Krishi Community Feed"
        showBack
        onBack={() => navigation?.goBack?.()}
        rightComponent={
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.newPostHeaderBtn}>
            <Text style={styles.newPostHeaderTxt}>+ Ask / Share</Text>
          </TouchableOpacity>
        }
      />

      {loading && !refreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchFeed();
              }}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Discussions Yet"
              description="Be the first farmer to share an agronomic technique or field question!"
              icon="🌾"
            />
          }
        />
      )}

      {/* Create Post Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Field Experience / Question</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeTxt}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.inputTitle}
              placeholder="Topic or Crop Headline (e.g., Sugarcane Tillering)"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={styles.inputBody}
              placeholder="Describe your farming observation, soil test result, or pest question in detail..."
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={4}
            />

            <Button
              title={posting ? 'Publishing...' : 'Publish to Krishi Community'}
              variant="primary"
              onPress={handleCreatePost}
              loading={posting}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>

      {/* Comments Drawer Modal */}
      <Modal visible={!!activePost} animationType="slide" transparent onRequestClose={() => setActivePost(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Replies & Expert Advice</Text>
              <TouchableOpacity onPress={() => setActivePost(null)}>
                <Text style={styles.closeTxt}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentAuthor}>{item.author_name}</Text>
                  <Text style={styles.commentText}>{item.content}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.noCommentsTxt}>No replies yet. Share your experience!</Text>
              }
              style={{ maxHeight: 250 }}
            />

            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write agronomic reply or advice..."
                value={commentText}
                onChangeText={setCommentText}
              />
              <Button
                title="Post"
                variant="primary"
                onPress={handleAddComment}
                loading={commenting}
                style={styles.sendCommentBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPostHeaderBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  newPostHeaderTxt: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  postCard: {
    padding: 16,
    marginBottom: 14,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  authorLocation: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  postContent: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  postImg: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 10,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionTxt: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  closeTxt: {
    fontSize: 18,
    color: colors.textSecondary,
    padding: 4,
  },
  inputTitle: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  inputBody: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    height: 100,
    textAlignVertical: 'top',
  },
  commentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  commentText: {
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 2,
  },
  noCommentsTxt: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingVertical: 20,
    fontSize: 13,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
  },
  sendCommentBtn: {
    paddingHorizontal: 14,
  },
});
