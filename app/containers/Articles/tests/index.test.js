import React from 'react';
import { push } from 'react-router-redux';
import { Helmet } from 'react-helmet';
import { shallow, mount } from 'enzyme';
import ReactPaginate from 'react-paginate';
import { Alert, Card, CardTitle, CardText, CardLink, Row, Col, Button } from 'reactstrap';
import Loader from 'components/Loader';
import AuthorCard from 'components/AuthorCard';
import ArticleTags from 'components/ArticleTags';
import Wrapper from '../Wrapper';
import { Articles, mapDispatchToProps } from '../index';
import {
  fetchArticles,
  fetchArticlesByAuthor,
  fetchArticlesFavoritedByAuthor,
} from '../actions';
import { BASE_LIMIT } from '../../../utils/url';

const samplePostData = [
  {
    author: {
      bio: 'ab cdadaf',
      following: false,
      image: 'https://static.productionready.io/images/smiley-cyrus.jpg',
      username: 'trinhnguyen',
    },
    title: 'sample title',
    description: 'sample description',
    createdAt: '2017-10-27T00:13:15.524Z',
    slug: 'hello-world-31l68b',
    favoritesCount: 1,
    favorited: true,
    tagList: [
      'dragons',
      'angularjs',
      'reactjs',
    ],
  },
];

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
        match={{
          params: {},
        }}
        posts={samplePostData}
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
        posts={samplePostData}
      />
    );
    const { author, title, description, createdAt, slug, favoritesCount, favorited } = samplePostData[0];
    const expectedComponent = (
      <Wrapper>
        <Card body>
          <Row style={{ marginBottom: '10px' }}>
            <Col xs="6">
              <AuthorCard
                author={author}
                createdAt={new Date(createdAt).toDateString()}
              />
            </Col>
            <Col xs="6">
              <div className="text-right">
                <Button
                  active={favorited}
                  outline
                  color="primary"
                  size="sm"
                >
                  <i className="ion-heart"></i>
                  {favoritesCount}
                </Button>
              </div>
            </Col>
          </Row>
          <CardTitle>{title}</CardTitle>
          <CardText>{description}</CardText>
          <Row>
            <Col xs="6">
              <CardLink href={`/article/${slug}`}>
                Read More
              </CardLink>
            </Col>
            <Col className="text-right" xs="6">
              <ArticleTags tagList={samplePostData[0].tagList} />
            </Col>
          </Row>
        </Card>
      </Wrapper>
    );
    expect(component.contains(expectedComponent)).toEqual(true);
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
        match={{
          params: {},
        }}
        pageCount={basePageCount}
        posts={samplePostData}
      />
    );
    const paginationComponentProps = component.find(ReactPaginate).props();
    const { forcePage, pageCount } = paginationComponentProps;

    expect(forcePage).toEqual(searchPageParam - 1);
    expect(pageCount).toEqual(basePageCount / BASE_LIMIT);
  });

  it('should call componentWillReceiveProps', () => {
    const onFetchArticlesSpy = jest.fn();
    const onFetchArticlesFavoritedByAuthorSpy = jest.fn();
    const onFetchArticlesByAuthorSpy = jest.fn();

    const component = mount(
      <Articles
        fetching={false}
        error={false}
        onFetchArticles={onFetchArticlesSpy}
        onFetchArticlesFavoritedByAuthor={onFetchArticlesFavoritedByAuthorSpy}
        onFetchArticlesByAuthor={onFetchArticlesByAuthorSpy}
        onPageChange={() => {}}
        location={{
          search: '?page=1',
        }}
        match={{
          params: {},
        }}
        posts={samplePostData}
      />
    );
    expect(onFetchArticlesSpy).toHaveBeenCalled();
    component.setProps({
      location: {
        search: '?favorited',
      },
      match: {
        params: {
          username: '@john_doe',
        },
      },
    });
    expect(onFetchArticlesFavoritedByAuthorSpy).toHaveBeenCalled();
    component.setProps({
      location: {
        search: '?page=1',
      },
    });
    expect(onFetchArticlesByAuthorSpy).toHaveBeenCalled();
    component.setProps({
      onFetchArticles: onFetchArticlesSpy,
    });
    component.instance().componentWillReceiveProps({
      location: {
        search: '?page=2',
      },
      match: {
        params: {
          username: '@john_doe',
        },
      },
    });
    expect(onFetchArticlesSpy).toHaveBeenCalled();
  });

  it('should call onFetchArticlesFavoritedByAuthor', () => {
    const onFetchArticlesFavoritedByAuthorSpy = jest.fn();
    mount(
      <Articles
        fetching={false}
        error={false}
        onFetchArticles={() => {}}
        onPageChange={() => {}}
        onFetchArticlesFavoritedByAuthor={onFetchArticlesFavoritedByAuthorSpy}
        location={{
          search: '?favorited',
        }}
        match={{
          params: {
            username: '@john_doe',
          },
        }}
        posts={samplePostData}
      />
    );
    expect(onFetchArticlesFavoritedByAuthorSpy).toHaveBeenCalled();
  });

  it('should call onFetchArticlesByAuthor', () => {
    const onFetchArticlesByAuthorSpy = jest.fn();
    mount(
      <Articles
        fetching={false}
        error={false}
        onFetchArticles={() => {}}
        onPageChange={() => {}}
        onFetchArticlesByAuthor={onFetchArticlesByAuthorSpy}
        location={{
          search: '',
        }}
        match={{
          params: {
            username: '@john_doe',
          },
        }}
        posts={samplePostData}
      />
    );
    expect(onFetchArticlesByAuthorSpy).toHaveBeenCalled();
  });

  it('should prepare the page url', () => {
    const component = shallow(
      <Articles
        fetching={false}
        error={false}
        onFetchArticles={() => {}}
        onPageChange={() => {}}
        onFetchArticlesByAuthor={() => {}}
        filters={{
          username: '',
          search: '',
        }}
        location={{
          search: '?page=1',
        }}
        match={{
          params: {
            username: '',
          },
        }}
        posts={samplePostData}
      />
    );
    expect(component.instance().preparePageUrl(2)).toEqual('/?page=2');

    component.setProps({
      location: {
        search: '?tag=foo',
      },
    });
    expect(component.instance().preparePageUrl(2)).toEqual('/?tag=foo&page=2');

    component.setProps({
      location: {
        search: '',
      },
      match: {
        params: {
          username: '@john_doe',
        },
      },
    });
    expect(component.instance().preparePageUrl(2)).toEqual('/author/@john_doe?page=2');

    component.setProps({
      location: {
        search: '?favorited',
      },
      match: {
        params: {
          username: '@john_doe',
        },
      },
    });
    expect(component.instance().preparePageUrl(2)).toEqual('/author/@john_doe?favorited&page=2');
  });

  it('should not render the default <Helmet /> when this.props.filters have value', () => {
    const component = shallow(
      <Articles
        fetching={false}
        error={false}
        filters={{
          username: '@john_doe',
          search: '?favorited',
        }}
        onFetchArticles={() => {}}
        onPageChange={() => {}}
        posts={[]}
      />
    );

    expect(component.find(Helmet).length).toEqual(0);
  });

  describe('<ReactPaginate />', () => {
    it('should call onFetchArticles and onPageChange when <ReactPaginate /> onPageChange triggered', () => {
      const onFetchArticlesSpy = jest.fn();
      const onPageChangeSpy = jest.fn();

      const component = mount(
        <Articles
          fetching={false}
          error={false}
          onFetchArticles={onFetchArticlesSpy}
          onPageChange={onPageChangeSpy}
          location={{
            search: '?page=1',
          }}
          match={{
            params: {},
          }}
          posts={samplePostData}
        />
      );

      component.find(ReactPaginate).props().onPageChange({ selected: 2 });
      expect(onFetchArticlesSpy).toHaveBeenCalled();
      expect(onPageChangeSpy).toHaveBeenCalled();
    });
  });

  describe('mapDispatchToProps', () => {
    describe('onFetchArticles', () => {
      it('should be injected', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        expect(result.onFetchArticles).toBeDefined();
      });
      it('should dispatch fetchArticles when called', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        const page = 1;
        const tag = 'foo';
        result.onFetchArticles(page, tag);
        expect(dispatch).toHaveBeenCalledWith(fetchArticles(page, tag));
      });
    });

    describe('onPageChange', () => {
      it('should be injected', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        expect(result.onPageChange).toBeDefined();
      });
      it('should not dispatch onPageChange when called if page param is null', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        result.onPageChange();
        expect(dispatch).not.toHaveBeenCalled();
      });
      it('should dispatch onPageChange when called', () => {
        const page = 'link';
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        result.onPageChange(page);
        expect(dispatch).toHaveBeenCalledWith(push(page));
      });
    });

    describe('onFetchArticlesByAuthor', () => {
      it('should be injected', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        expect(result.onFetchArticlesByAuthor).toBeDefined();
      });
      it('should dispatch fetchArticlesByAuthor when called', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        const page = 1;
        const username = '@john_doe';
        result.onFetchArticlesByAuthor(page, username);
        expect(dispatch).toHaveBeenCalledWith(fetchArticlesByAuthor(page, username));
      });
    });

    describe('onFetchArticlesFavoritedByAuthor', () => {
      it('should be injected', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        expect(result.onFetchArticlesFavoritedByAuthor).toBeDefined();
      });
      it('should dispatch fetchArticlesFavoritedByAuthor when called', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        const page = 1;
        const username = '@john_doe';
        result.onFetchArticlesFavoritedByAuthor(page, username);
        expect(dispatch).toHaveBeenCalledWith(fetchArticlesFavoritedByAuthor(page, username));
      });
    });
  });
});
