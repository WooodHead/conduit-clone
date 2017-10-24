import React from 'react';
import { push } from 'react-router-redux';
import { shallow, mount } from 'enzyme';
import ReactPaginate from 'react-paginate';
import { Alert, Card, CardTitle, CardText } from 'reactstrap';
import Loader from 'components/Loader';
import Wrapper from '../Wrapper';
import { Articles, mapDispatchToProps } from '../index';
import { fetchArticles } from '../actions';
import { BASE_LIMIT } from '../../../utils/url';

describe('<Articles />', () => {
  it('should display a loading icon while fetching', () => {
    const component = shallow(
      <Articles
        fetching
        error
        onFetchArticles={() => {}}
        onPageChange={() => {}}
        posts={[]}
      />
    );
    expect(component.contains(<Loader />)).toEqual(true);
  });

  it('should display an error message after fetching the articles and it throws and error', () => {
    const component = shallow(
      <Articles
        fetching={false}
        error
        onFetchArticles={() => {}}
        onPageChange={() => {}}
        posts={[]}
      />
    );
    const expectedComponent = (
      <Alert color="danger">
        This is a warning alert — check it out!
      </Alert>
    );
    expect(component.contains(expectedComponent)).toEqual(true);
  });

  it('should display and alert mesage after fetching is completed and returns an empty articles', () => {
    const component = shallow(
      <Articles
        fetching={false}
        error={false}
        onFetchArticles={() => {}}
        onPageChange={() => {}}
        posts={[]}
      />
    );
    const expectedComponent = (
      <Alert color="info">
        This is a warning alert — check it out!
      </Alert>
    );
    expect(component.contains(expectedComponent)).toEqual(true);
  });

  it('should call onFetchArticles if location.search is not empty', () => {
    const submitSpy = jest.fn();
    mount(
      <Articles
        fetching={false}
        error={false}
        onFetchArticles={submitSpy}
        onPageChange={() => {}}
        location={{
          search: '?page=1',
        }}
        posts={[
          {
            title: 'sample title',
            description: 'sample description',
            createdAt: 'sample date',
          },
        ]}
      />
    );
    expect(submitSpy).toHaveBeenCalled();
  });

  it('should render a post', () => {
    const component = shallow(
      <Articles
        fetching={false}
        error={false}
        onFetchArticles={() => {}}
        onPageChange={() => {}}
        location={{
          search: '?page=100',
        }}
        posts={[
          {
            title: 'sample title',
            description: 'sample description',
            createdAt: 'sample date',
          },
        ]}
      />
    );
    const expectedComponent = (
      <Wrapper>
        <Card body>
          <CardTitle>sample title</CardTitle>
          <CardText>sample description</CardText>
          <CardText>
            <small className="text-muted">sample date</small>
          </CardText>
        </Card>
      </Wrapper>
    );
    expect(component.contains(expectedComponent)).toEqual(true);
  });

  it('should call onFetchArticles and onPageChange when <ReactPaginate /> onPageChange triggered', () => {
    const onFetchArticlesSpy = jest.fn();
    const onPageChangeSpy = jest.fn();

    const component = shallow(
      <Articles
        fetching={false}
        error={false}
        onFetchArticles={onFetchArticlesSpy}
        onPageChange={onPageChangeSpy}
        location={{
          search: '?page=100',
        }}
        posts={[
          {
            title: 'sample title',
            description: 'sample description',
            createdAt: 'sample date',
          },
        ]}
      />
    );

    component.find(ReactPaginate).props().onPageChange({ selected: 1 });
    expect(onFetchArticlesSpy).toHaveBeenCalled();
    expect(onPageChangeSpy).toHaveBeenCalled();
  });

  it('should match the fixture for the location.search and forcePage props', () => {
    const searchPageParam = 3;
    const basePageCount = 500;
    const component = mount(
      <Articles
        fetching={false}
        error={false}
        onFetchArticles={() => {}}
        onPageChange={() => {}}
        location={{
          search: `?page=${searchPageParam}`,
        }}
        pageCount={basePageCount}
        posts={[
          {
            title: 'sample title',
            description: 'sample description',
            createdAt: 'sample date',
          },
        ]}
      />
    );
    const paginationComponentProps = component.find(ReactPaginate).props();
    const { forcePage, pageCount } = paginationComponentProps;

    expect(forcePage).toEqual(searchPageParam - 1);
    expect(pageCount).toEqual(basePageCount / BASE_LIMIT);
  });

  describe('mapDispatchToProps', () => {
    describe('onFetchArticles', () => {
      it('should be injected', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        expect(result.onFetchArticles).toBeDefined();
      });
    });

    describe('onPageChange', () => {
      it('should be injected', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        expect(result.onPageChange).toBeDefined();
      });
    });

    it('should dispatch fetchArticles when called', () => {
      const dispatch = jest.fn();
      const result = mapDispatchToProps(dispatch);
      const page = 1;
      result.onFetchArticles(page);
      expect(dispatch).toHaveBeenCalledWith(fetchArticles(page));
    });

    it('should dispatch onPageChange when called', () => {
      const page = 1;
      const dispatch = jest.fn();
      const result = mapDispatchToProps(dispatch);
      result.onPageChange(page);
      expect(dispatch).toHaveBeenCalledWith(push(`/?page=${page}`));
    });

    it('should not dispatch onPageChange when called if page param is null', () => {
      const dispatch = jest.fn();
      const result = mapDispatchToProps(dispatch);
      result.onPageChange();
      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});
