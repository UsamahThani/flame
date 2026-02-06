import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../../store/reducers';
import { bindActionCreators } from 'redux';
import { actionCreators } from '../../store';

// Typescript
import { App, Category } from '../../interfaces';

// UI
import { Icon, Container, SectionHeadline, Spinner, Message } from '../UI';

// CSS
import classes from './Home.module.css';

// Components
import { AppGrid } from '../Apps/AppGrid/AppGrid';
import { BookmarkGrid } from '../Bookmarks/BookmarkGrid/BookmarkGrid';
import { SearchBar } from '../SearchBar/SearchBar';
import { Header } from './Header/Header';

// Utils
import { escapeRegex } from '../../utility';

const ALT_LINK_KEY = 'useAlternativeLinks';

export const Home = (): JSX.Element => {
  const {
    apps: { apps, loading: appsLoading },
    bookmarks: { categories, loading: bookmarksLoading },
    config: { config },
    auth: { isAuthenticated },
  } = useSelector((state: State) => state);

  const dispatch = useDispatch();
  const { getApps, getCategories } = bindActionCreators(
    actionCreators,
    dispatch
  );

  // Search state
  const [localSearch, setLocalSearch] = useState<string | null>(null);
  const [appSearchResult, setAppSearchResult] = useState<App[] | null>(null);
  const [bookmarkSearchResult, setBookmarkSearchResult] = useState<
    Category[] | null
  >(null);

  // ⬇️ Persistent toggle (null = not loaded yet)
  const [useAlternativeLinks, setUseAlternativeLinks] = useState<
    boolean | null
  >(null);

  // Load toggle from localStorage (runs once)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ALT_LINK_KEY);
      setUseAlternativeLinks(saved === 'true');
    } catch {
      setUseAlternativeLinks(false);
    }
  }, []);

  // Persist toggle to localStorage
  useEffect(() => {
    if (useAlternativeLinks === null) return;
    try {
      localStorage.setItem(ALT_LINK_KEY, String(useAlternativeLinks));
    } catch {}
  }, [useAlternativeLinks]);

  // Load apps
  useEffect(() => {
    if (!apps.length) {
      getApps();
    }
  }, []);

  // Load bookmarks
  useEffect(() => {
    if (!categories.length) {
      getCategories();
    }
  }, []);

  // Search logic
  useEffect(() => {
    if (!localSearch) {
      setAppSearchResult(null);
      setBookmarkSearchResult(null);
      return;
    }

    setAppSearchResult(
      apps.filter(({ name, description }) =>
        new RegExp(escapeRegex(localSearch), 'i').test(`${name} ${description}`)
      )
    );

    const category = {
      ...categories[0],
      name: 'Search Results',
      bookmarks: categories
        .flatMap((c) => c.bookmarks)
        .filter(({ name }) =>
          new RegExp(escapeRegex(localSearch), 'i').test(name)
        ),
    };

    setBookmarkSearchResult([category]);
  }, [localSearch]);

  // Avoid render until toggle is loaded
  if (useAlternativeLinks === null) return <Spinner />;

  return (
    <Container>
      {!config.hideSearch && (
        <SearchBar
          setLocalSearch={setLocalSearch}
          appSearchResult={appSearchResult}
          bookmarkSearchResult={bookmarkSearchResult}
        />
      )}

      <Header />

      {!isAuthenticated &&
        !apps.some((a) => a.isPinned) &&
        !categories.some((c) => c.isPinned) && (
          <Message>
            Welcome to Flame! Go to <Link to="/settings/app">/settings</Link>,
            login and start customizing your new homepage
          </Message>
        )}

      {!config.hideApps && (isAuthenticated || apps.some((a) => a.isPinned)) && (
        <Fragment>
          <div className={classes.SectionHeader}>
            <SectionHeadline title="Applications" link="/applications" />
            <label
              className={classes.Switch}
              title="Toggle to use Tailscale links"
            >
              <input
                type="checkbox"
                checked={useAlternativeLinks}
                onChange={() => setUseAlternativeLinks((v) => !v)}
              />
              <span className={classes.Slider}></span>
            </label>
          </div>

          {appsLoading ? (
            <Spinner />
          ) : (
            <AppGrid
              apps={appSearchResult ?? apps.filter(({ isPinned }) => isPinned)}
              totalApps={apps.length}
              searching={!!localSearch}
              useAlternativeLinks={useAlternativeLinks}
            />
          )}

          <div className={classes.HomeSpace}></div>
        </Fragment>
      )}

      {!config.hideCategories &&
        (isAuthenticated || categories.some((c) => c.isPinned)) && (
          <Fragment>
            <SectionHeadline title="Bookmarks" link="/bookmarks" />
            {bookmarksLoading ? (
              <Spinner />
            ) : (
              <BookmarkGrid
                categories={
                  bookmarkSearchResult ??
                  categories.filter(
                    ({ isPinned, bookmarks }) => isPinned && bookmarks.length
                  )
                }
                totalCategories={categories.length}
                searching={!!localSearch}
                fromHomepage
              />
            )}
          </Fragment>
        )}

      <Link to="/settings" className={classes.SettingsButton}>
        <Icon icon="mdiCog" color="var(--color-background)" />
      </Link>
    </Container>
  );
};
