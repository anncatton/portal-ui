import React from 'react';
import { connect } from 'react-redux';
import decode from 'jwt-decode';
import Aux from '@ncigdc/utils/Aux';

export default connect()(
  class extends React.Component {
    state = { loggingIn: false };
    showGoogleLogin = () => {
      this.setState({ loggingIn: true });
      window.gapi.signin2.render('g-signin2', {
        onsuccess: user => {
          const { id_token } = user.getAuthResponse();
          fetch(
            'https://ec2-54-234-114-228.compute-1.amazonaws.com:8081/oauth/google/token',
            {
              headers: {
                'content-type': 'application/json',
                id_token,
              },
            },
          )
            .then(r => r.text())
            .then(token => {
              const decoded = decode(token);
              this.props.dispatch({
                type: 'gdc/USER_SUCCESS',
                payload: {
                  username: decoded.username,
                },
                project_ids: ['TCGA-LGG', 'TCGA-BLCA', 'TCGA-UCS'],
              });
            });
        },
      });
    };
    render() {
      return (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            backgroundColor: 'white',
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              height: '400px',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <h1>Welcome to the AWG Portal</h1>
            {!this.state.loggingIn && (
              <Aux>
                <img
                  style={{
                    cursor: 'pointer',
                    boxShadow:
                      '0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.3)',
                    width: '50px',
                    height: '50px',
                    padding: '10px',
                    borderRadius: '100%',
                  }}
                  src="https://images.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                  onClick={this.showGoogleLogin}
                />
                <img
                  style={{
                    marginLeft: '20px',
                    cursor: 'pointer',
                    boxShadow:
                      '0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.3)',
                    width: '50px',
                    height: '50px',
                    padding: '10px',
                    borderRadius: '100%',
                  }}
                  src="https://blog.addthiscdn.com/wp-content/uploads/2015/11/logo-facebook.png"
                />
              </Aux>
            )}

            <br />
            <div
              id="g-signin2"
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            />
          </div>
        </div>
      );
    }
  },
);
