
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

const Feed = lazy(() => import('../../pages/Feed').then(m => ({ default: m.Feed })));
const PostDetails = lazy(() => import('../../pages/PostDetails').then(m => ({ default: m.PostDetails })));
const CreatePost = lazy(() => import('../../pages/CreatePost').then(m => ({ default: m.CreatePost })));
const CreatePoll = lazy(() => import('../../pages/CreatePoll').then(m => ({ default: m.CreatePoll })));
const Reels = lazy(() => import('../../pages/Reels').then(m => ({ default: m.Reels })));
const CreateReel = lazy(() => import('../../pages/CreateReel').then(m => ({ default: m.CreateReel })));
const ReelsSearch = lazy(() => import('../../pages/ReelsSearch').then(m => ({ default: m.ReelsSearch })));
const FeedSearch = lazy(() => import('../../pages/FeedSearch').then(m => ({ default: m.FeedSearch })));

export const feedRoutes = [
  { path: '/feed', element: <ProtectedRoute><Feed /></ProtectedRoute> },
  { path: '/post/:id', element: <ProtectedRoute><PostDetails /></ProtectedRoute> },
  { path: '/create-post', element: <ProtectedRoute><CreatePost /></ProtectedRoute> },
  { path: '/create-poll', element: <ProtectedRoute><CreatePoll /></ProtectedRoute> },
  { path: '/reels', element: <ProtectedRoute><Reels /></ProtectedRoute> },
  { path: '/reels/:id', element: <ProtectedRoute><Reels /></ProtectedRoute> },
  { path: '/reels-search', element: <ProtectedRoute><ReelsSearch /></ProtectedRoute> },
  { path: '/feed-search', element: <ProtectedRoute><FeedSearch /></ProtectedRoute> },
  { path: '/create-reel', element: <ProtectedRoute><CreateReel /></ProtectedRoute> }
];
