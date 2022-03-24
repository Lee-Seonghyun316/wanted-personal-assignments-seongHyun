import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import styled from 'styled-components';
import ReactLoading from 'react-loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGetReviewsQuery } from '../redux/fetchReviews';
import { faArrowRotateRight } from '@fortawesome/free-solid-svg-icons';
import Head from '../components/common/MainHeader';
import Filter from '../components/common/Filter';
import Grid from '../components/Grid';
import List from '../components/common/List';
import {
  addData,
  addRandomData,
  deleteData,
  incrementPage,
  pageInitialize,
  randomSort,
} from '../redux/reviews';
import { sortData } from '../data';
import SortModal from '../components/common/SortModal';
import ReviewDetail from './ReviewDetail';
import ShareModal from '../components/common/ShareModal';
import { useStopScroll } from '../hooks/useStopScroll';

const ReviewList = () => {
  const [copyId, setCopyId] = useState(null);
  const [current, setCurrent] = useState('list');
  const [index, setIndex] = useState(0);
  const [target, setTarget] = useState(null);
  const { page, reviews } = useSelector(
    (state) => ({ page: state.reviews.page, reviews: state.reviews.data }),
    shallowEqual
  );
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('grid');
  const [sort, setSort] = useState('recent');
  const [sortModal, setSortModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const dispatch = useDispatch();
  const { data, error, isSuccess, isError, isFetching, isLoading } = useGetReviewsQuery({
    page: page,
    sort: sort === 'random' ? 'recent' : sort,
  });
  useEffect(() => {
    window.onbeforeunload = function pushRefresh() {
      window.scrollTo(0, 0);
    };
  }, []);
  useEffect(() => {
    let observer;
    if (target) {
      observer = new IntersectionObserver(onIntersect, {
        threshold: 0.2,
      });
      observer.observe(target);
    }
    return () => observer && observer.disconnect();
  }, [target]);
  useEffect(() => {
    if (data) {
      sort === 'random' ? dispatch(addRandomData(data.data)) : dispatch(addData(data.data));
    }
  }, [data]);
  useEffect(() => {
    if (isLoading) {
      loadingHandling();
    }
  }, [isLoading]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [current]);
  const loadingHandling = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };
  const onIntersect = async ([entry], observer) => {
    if (entry.isIntersecting) {
      await dispatch(incrementPage());
    }
  };
  const handleClickViewType = (e) => {
    const value = e.currentTarget.id;
    setViewType(value);
  };
  const handleClickSortType = async (e) => {
    const value = e.currentTarget.id;
    await setSort(value);
    if (value === 'random') {
      dispatch(randomSort());
      return;
    }
    await dispatch(deleteData());
    await dispatch(pageInitialize());
  };
  const deleteTag = async () => {
    setSort('recent');
    await dispatch(deleteData());
    await dispatch(pageInitialize());
  };
  const searchTagName = (id) => {
    return sortData.map(
      (data) =>
        data.id === id && (
          <Tag key={data.id}>
            {data.name}
            {id !== 'recent' && (
              <DeleteTag onClick={deleteTag}>
                <DeleteImg src="https://static.balaan.co.kr/mobile/img/icon/search/ic_close_b.png" alt="delete" />
              </DeleteTag>
            )}
          </Tag>
        )
    );
  };
  const closeModal = () => {
    setSortModal(false);
  };
  const handleApplyButton = () => {
    closeModal();
    loadingHandling();
  };
  const handleClickSort = () => {
    setSortModal(true);
  };
  const handleClickDetail = (index) => {
    setCurrent('detail');
    setIndex(index);
  };
  useStopScroll(shareModal);
  useStopScroll(sortModal);

  return (
    <Wrap>
      {current === 'list' && (
        <div>
          <Head />
          <Filters>
            <Filter text="정렬" type="main" onClick={handleClickSort} />
            <Filter text="성별" type="main" />
            <Filter text="인기 디자이너" />
            <Filter text="카테고리" />
          </Filters>
          <Tags>
            {searchTagName(sort)}
            <Tag>전체</Tag>
            <Refresh onClick={deleteTag}>
              <FontAwesomeIcon icon={faArrowRotateRight} />
            </Refresh>
          </Tags>
          {loading && (
            <LoaderWrap>
              <ReactLoading type="spin" color="#000" width="3rem" height="3rem" />
            </LoaderWrap>
          )}
          <ViewChoice>
            <ChoiceButton selected={viewType === 'grid'} onClick={handleClickViewType} id="grid">
              <ViewChoiceImg src="https://static.balaan.co.kr/mobile/img/icon/contents/tab-icon-01@2x.png" alt="gird" />
            </ChoiceButton>
            <ChoiceButton selected={viewType === 'list'} onClick={handleClickViewType} id="list">
              <ViewChoiceImg src="https://static.balaan.co.kr/mobile/img/icon/contents/tab-icon-02@2x.png" alt="list" />
            </ChoiceButton>
          </ViewChoice>
          {viewType === 'grid' ? (
            <Grid handleClickDetail={handleClickDetail} />
          ) : (
            <List data={reviews} setShareModal={setShareModal} setCopyId={setCopyId} />
          )}
          <InfiniteLoading ref={setTarget}>
            {!loading && isFetching && <ReactLoading type="spin" color="#000" width="3rem" height="3rem" />}
          </InfiniteLoading>
          {sortModal && (
            <SortModal
              closeModal={closeModal}
              handleClickSortType={handleClickSortType}
              handleApplyButton={handleApplyButton}
              sort={sort}
            />
          )}
          {shareModal && <ShareModal setShareModal={setShareModal} reviewId={copyId} sort={sort} />}
        </div>
      )}
      {current === 'detail' && <ReviewDetail setCurrent={setCurrent} index={index} currentSort={sort} />}
    </Wrap>
  );
};

export default ReviewList;

const Wrap = styled.div``;

const ReviewListContainer = styled.div`
  ${({ modalVisible }) => modalVisible && 'position:fixed;width:100%;height:100%;overflow:hidden;'};
`;

const LoaderWrap = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  box-shadow: 2px 2px 20px 2px grey;
  padding: 1.5rem;
  border-radius: 20px;
  z-index: 1;
`;

const Filters = styled.div`
  display: flex;
  padding: 0 1rem;
  gap: 10px;
  ${({ theme }) => theme.common.hideScrollBar}
`;

const Tags = styled.ul`
  position: relative;
  display: flex;
  gap: 10px;
  padding: 1rem;
  margin-top: 1rem;
  background-color: ${({ theme }) => theme.color.lightGrey};
`;

const Tag = styled.li`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.color.lightBlue};
  border-radius: 3rem;
  color: ${({ theme }) => theme.color.blue};
  font-size: ${({ theme }) => theme.fontSize.xSmall};
  font-weight: 600;
`;

const DeleteTag = styled.button`
  cursor: pointer;
`;

const DeleteImg = styled.img`
  width: 0.8rem;
`;

const Refresh = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 1rem;
  color: ${({ theme }) => theme.color.grey};
  font-size: ${({ theme }) => theme.fontSize.xSmall};
  cursor: pointer;
`;

const ViewChoice = styled.div`
  width: 100%;
`;

const ChoiceButton = styled.button`
  padding: 1rem 0;
  width: 50%;
  border-bottom: 2px solid ${({ theme }) => theme.color.black};
  opacity: ${({ selected }) => (selected ? 1 : 0.3)};
  cursor: pointer;
`;

const ViewChoiceImg = styled.img`
  width: 2rem;
`;

const InfiniteLoading = styled.div`
  padding: 2rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
