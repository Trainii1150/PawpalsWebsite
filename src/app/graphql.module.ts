import { NgModule } from '@angular/core';
import { HttpLink } from 'apollo-angular/http';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache, split } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
//import { ApolloLink } from '@apollo/client';

const httpUri = 'http://localhost:3000/graphql'; // GraphQL HTTP endpoint
const wsUri = 'ws://localhost:3000/graphql'; // GraphQL WebSocket endpoint

export function createApollo(httpLink: HttpLink, cookieService: CookieService): ApolloClientOptions<any> {
  const authLink = setContext((_, { headers }) => {
    const token = cookieService.get('auth_key');
    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : '',
      }),
    };
  });

  const http = httpLink.create({ uri: httpUri });

  const wsLink = new WebSocketLink({
    uri: wsUri,
    options: {
      reconnect: true,
      connectionParams: {
        authToken: cookieService.get('auth_key'),
      },
    },
  });

  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    authLink.concat(http)
  );

  return {
    link,
    cache: new InMemoryCache(),
  };
}

@NgModule({
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink, CookieService],
    },
  ],
})
export class GraphQLModule {}
