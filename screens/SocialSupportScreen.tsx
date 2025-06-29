import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Users, MessageCircle, Heart, Lock, Shield, User, HeartHandshake } from 'lucide-react-native';
import MobileNavbar from '../components/MobileNavbar';
import EmergencyButton from '../components/EmergencyButton';
import Header from '../components/Header';

interface SupportGroup {
  id: number;
  name: string;
  members: number;
  lastActive: string;
  topics: string[];
  isPrivate: boolean;
}

interface ForumPost {
  id: number;
  title: string;
  author: string;
  time: string;
  replies: number;
  likes: number;
  tags: string[];
}

interface Connection {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

const SocialSupportScreen = () => {
  const [activeTab, setActiveTab] = useState('groups');
  
  const supportGroups: SupportGroup[] = [
    {
      id: 1,
      name: 'Anxiety Support Circle',
      members: 243,
      lastActive: '10 minutes ago',
      topics: ['Social Anxiety', 'General Anxiety', 'Coping Strategies'],
      isPrivate: false
    },
    {
      id: 2,
      name: 'Mindfulness Practice',
      members: 185,
      lastActive: '1 hour ago',
      topics: ['Meditation', 'Daily Techniques', 'Experiences'],
      isPrivate: true
    },
    {
      id: 3,
      name: 'Work Stress Management',
      members: 317,
      lastActive: '35 minutes ago',
      topics: ['Burnout', 'Work-Life Balance', 'Productivity'],
      isPrivate: false
    }
  ];
  
  const forumPosts: ForumPost[] = [
    {
      id: 1,
      title: 'How do you handle social anxiety at work events?',
      author: 'Anonymous',
      time: '2 hours ago',
      replies: 15,
      likes: 27,
      tags: ['Social Anxiety', 'Workplace']
    },
    {
      id: 2,
      title: 'Meditation technique that worked for my panic attacks',
      author: 'MindfulJourney',
      time: '1 day ago',
      replies: 43,
      likes: 76,
      tags: ['Meditation', 'Panic Attacks', 'Success Story']
    },
    {
      id: 3,
      title: 'Need advice for helping a family member with depression',
      author: 'Anonymous',
      time: '3 hours ago',
      replies: 8,
      likes: 12,
      tags: ['Family Support', 'Depression']
    }
  ];
  
  const connections: Connection[] = [
    {
      id: 1,
      name: 'Support Buddy',
      lastMessage: 'Checking in - how are you feeling today?',
      time: '5 hours ago',
      unread: true
    },
    {
      id: 2,
      name: 'Wellness Coach',
      lastMessage: 'Great progress on your meditation streak!',
      time: '1 day ago',
      unread: false
    }
  ];

  const renderGroupCard = (group: SupportGroup) => (
    <View key={group.id} style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View>
          <View style={styles.groupTitleContainer}>
            <Text style={styles.groupTitle}>{group.name}</Text>
            {group.isPrivate && (
              <Lock size={14} color="#6B7280" />
            )}
          </View>
          <Text style={styles.groupMeta}>
            {group.members} members · Active {group.lastActive}
          </Text>
        </View>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.topicsContainer}>
        {group.topics.map(topic => (
          <View key={topic} style={styles.topicTag}>
            <Text style={styles.topicText}>{topic}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.groupFooter}>
        <View style={styles.membersPreview}>
          {[...Array(3)].map((_, i) => (
            <View key={i} style={styles.memberAvatar}>
              <Text style={styles.memberInitial}>{String.fromCharCode(65 + i)}</Text>
            </View>
          ))}
          <View style={[styles.memberAvatar, styles.moreMembers]}>
            <Text style={styles.moreMembersText}>+{group.members - 3}</Text>
          </View>
        </View>
        
        <View style={styles.groupType}>
          {group.isPrivate ? (
            <View style={styles.groupTypeItem}>
              <Shield size={12} color="#6B7280" />
              <Text style={styles.groupTypeText}>Private Group</Text>
            </View>
          ) : (
            <View style={styles.groupTypeItem}>
              <Users size={12} color="#6B7280" />
              <Text style={styles.groupTypeText}>Open Group</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderForumPost = (post: ForumPost) => (
    <View key={post.id} style={styles.forumPost}>
      <Text style={styles.postTitle}>{post.title}</Text>
      <View style={styles.postMeta}>
        <Text style={styles.postAuthor}>{post.author}</Text>
        <Text style={styles.postTime}>{post.time}</Text>
      </View>
      
      <View style={styles.tagsContainer}>
        {post.tags.map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.separator} />
      
      <View style={styles.postFooter}>
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <MessageCircle size={14} color="#6B7280" />
            <Text style={styles.statText}>{post.replies} replies</Text>
          </View>
          <View style={styles.statItem}>
            <Heart size={14} color="#6B7280" />
            <Text style={styles.statText}>{post.likes} likes</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.readButton}>
          <Text style={styles.readButtonText}>Read</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConnection = (connection: Connection) => (
    <View key={connection.id} style={styles.connectionItem}>
      <View style={styles.connectionInfo}>
        <View style={styles.connectionAvatar}>
          <User size={20} color="#7C3AED" />
        </View>
        <View>
          <Text style={styles.connectionName}>{connection.name}</Text>
          <Text style={styles.connectionMessage}>{connection.lastMessage}</Text>
          <Text style={styles.connectionTime}>{connection.time}</Text>
        </View>
      </View>
      
      {connection.unread ? (
        <View style={styles.unreadIndicator} />
      ) : (
        <TouchableOpacity style={styles.messageButton}>
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Social Support" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* AI Social Insight */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={styles.insightIcon}>
              <HeartHandshake size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.insightTitle}>Social Connection</Text>
              <Text style={styles.insightText}>
                Maintaining social connections is key to mental wellbeing. You haven't connected with your support network in 3 days.
              </Text>
              <TouchableOpacity style={styles.reconnectButton}>
                <Text style={styles.reconnectButtonText}>Reconnect Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Navigation Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
              onPress={() => setActiveTab('groups')}
            >
              <Users size={18} color={activeTab === 'groups' ? '#7C3AED' : '#6B7280'} />
              <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
                Groups
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'forum' && styles.activeTab]}
              onPress={() => setActiveTab('forum')}
            >
              <MessageCircle size={18} color={activeTab === 'forum' ? '#7C3AED' : '#6B7280'} />
              <Text style={[styles.tabText, activeTab === 'forum' && styles.activeTabText]}>
                Forum
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'direct' && styles.activeTab]}
              onPress={() => setActiveTab('direct')}
            >
              <User size={18} color={activeTab === 'direct' ? '#7C3AED' : '#6B7280'} />
              <Text style={[styles.tabText, activeTab === 'direct' && styles.activeTabText]}>
                Direct
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Support Groups Tab */}
        {activeTab === 'groups' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Support Groups</Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Join New Group</Text>
              </TouchableOpacity>
            </View>
            
            {supportGroups.map(group => renderGroupCard(group))}
            
            <TouchableOpacity style={styles.browseButton}>
              <Text style={styles.browseButtonText}>Browse All Groups</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Forum Tab */}
        {activeTab === 'forum' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Community Forum</Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>New Post</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.forumFilters}>
              <View style={styles.filterButtons}>
                <TouchableOpacity style={styles.filterButtonActive}>
                  <Text style={styles.filterButtonTextActive}>All Posts</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton}>
                  <Text style={styles.filterButtonText}>My Activity</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.searchContainer}>
                <MessageCircle size={16} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search forum posts..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            
            {forumPosts.map(post => renderForumPost(post))}
            
            <TouchableOpacity style={styles.loadMoreButton}>
              <Text style={styles.loadMoreButtonText}>Load More Posts</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Direct Connections Tab */}
        {activeTab === 'direct' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Direct Support</Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>New Message</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.directInfoCard}>
              <Text style={styles.directInfoTitle}>About Direct Support</Text>
              <Text style={styles.directInfoText}>
                Connect privately with support buddies and wellness coaches for personalized guidance.
              </Text>
            </View>
            
            <View style={styles.connectionsList}>
              {connections.map(connection => renderConnection(connection))}
            </View>
            
            <View style={styles.matchCard}>
              <View style={styles.matchHeader}>
                <View style={styles.matchIcon}>
                  <HeartHandshake size={20} color="#7C3AED" />
                </View>
                <Text style={styles.matchTitle}>Find a Support Buddy</Text>
              </View>
              <Text style={styles.matchText}>
                Get matched with someone who understands what you're going through. Our AI will help find the perfect match.
              </Text>
              <TouchableOpacity style={styles.matchButton}>
                <Text style={styles.matchButtonText}>Get Matched</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <View style={styles.privacyHeader}>
            <View style={styles.privacyIcon}>
              <Shield size={16} color="#4B5563" />
            </View>
            <View>
              <Text style={styles.privacyTitle}>Privacy Protection</Text>
              <Text style={styles.privacyText}>
                All conversations are private and encrypted. You can remain anonymous in our community forums.
              </Text>
            </View>
          </View>
        </View>
        
        {/* Emergency Button */}
        <EmergencyButton />
      </ScrollView>
      
      <MobileNavbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  insightCard: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#E9D5FF',
    marginBottom: 12,
  },
  reconnectButton: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
  },
  reconnectButtonText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '500',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#7C3AED',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 4,
  },
  activeTabText: {
    color: '#7C3AED',
  },
  tabContent: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 4,
  },
  groupMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  viewButton: {
    padding: 4,
  },
  viewButtonText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '500',
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  topicTag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicText: {
    color: '#7C3AED',
    fontSize: 12,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membersPreview: {
    flexDirection: 'row',
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  memberInitial: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  moreMembers: {
    backgroundColor: '#F3E8FF',
  },
  moreMembersText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '500',
  },
  groupType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupTypeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  browseButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  },
  forumFilters: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  filterButtons: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginRight: 8,
  },
  filterButtonActive: {
    flex: 1,
    padding: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    marginRight: 8,
  },
  filterButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 14,
  },
  forumPost: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAuthor: {
    fontSize: 12,
    color: '#6B7280',
  },
  postTime: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#4B5563',
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  readButton: {
    padding: 4,
  },
  readButtonText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '500',
  },
  loadMoreButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadMoreButtonText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  },
  directInfoCard: {
    backgroundColor: '#F3E8FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9D5FF',
    padding: 16,
  },
  directInfoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7C3AED',
    marginBottom: 4,
  },
  directInfoText: {
    fontSize: 14,
    color: '#7C3AED',
  },
  connectionsList: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  connectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  connectionMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  connectionTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7C3AED',
  },
  messageButton: {
    padding: 4,
  },
  messageButtonText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '500',
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchIcon: {
    backgroundColor: '#F3E8FF',
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  matchText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  matchButton: {
    backgroundColor: '#7C3AED',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  matchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  privacyNotice: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  privacyIcon: {
    backgroundColor: '#E5E7EB',
    padding: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default SocialSupportScreen; 