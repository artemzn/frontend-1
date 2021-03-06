import * as React from 'react';
import styled from 'styled-components';
import { Button, Title, Input } from 'woly';
import { Link } from 'react-router-dom';

import { useStore, useEvent } from 'effector-react/ssr';
import { assignStart } from 'lib/effector';
import Logo from 'logo.svg';
import { CenterCardTemplate } from '@auth/ui';

import * as model from './model';
import { path } from 'pages/paths';

export const LoginPage = () => {
  const pageLoaded = useEvent(model.pageLoaded);
  React.useEffect(() => {
    pageLoaded({});
  }, []);

  const emailChanged = useEvent(model.emailChanged);
  const passwordChanged = useEvent(model.passwordChanged);
  const formSubmitted = useEvent(model.formSubmitted);
  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      formSubmitted();
    },
    [formSubmitted],
  );

  const formDisabled = useStore(model.$formDisabled);
  const email = useStore(model.$email);
  const password = useStore(model.$password);

  const failure = useStore(model.$failure);

  return (
    <CenterCardTemplate>
      <Container>
        <Logotype />

        <form onSubmit={handleSubmit}>
          <Title level={2}>Sign in</Title>

          {failure && <div>{failure}</div>}

          <Input
            placeholder="email"
            disabled={formDisabled}
            value={email}
            onChange={emailChanged}
          />
          <Input
            type="password"
            placeholder="password"
            disabled={formDisabled}
            value={password}
            onChange={passwordChanged}
          />

          <Group>
            <Button
              type="submit"
              disabled={formDisabled}
              text="Sign in"
              variant="primary"
            />
            <Button
              as={Link}
              to={path.register()}
              text="Sign up"
              variant="text"
            />
          </Group>
        </form>
      </Container>
    </CenterCardTemplate>
  );
};

assignStart(LoginPage, model.pageLoaded);

const Logotype = styled(Logo)`
  margin-bottom: 3rem;
  display: flex;
  flex-shrink: 0;
`;

const Group = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 3rem;

  & *:not(:first-child) {
    margin-left: 2rem;
  }

  &[data-direction='column'] {
    flex-direction: column;

    & *:not(:first-child) {
      margin-left: initial;
      margin-top: 1rem;
    }
  }
`;

const Footer = styled.footer`
  margin-top: 10rem;
  font-size: 1.2rem;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: content-box;
  height: 100%;
`;
