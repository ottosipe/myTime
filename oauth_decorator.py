import os
import webapp2
import jade
import json
import models

import httplib2
from oauth2client.appengine import OAuth2Decorator
from apiclient.discovery import build

decorator = {}

if os.environ['SERVER_SOFTWARE'].startswith('Development'):
  decorator = OAuth2Decorator(
    client_id='100813449163-vl4u1p376hjrc1e3gc090e8miarjnir3.apps.googleusercontent.com',
    client_secret='L3TfdZSaobeM9EANnUhivnyg',
    scope='https://www.googleapis.com/auth/calendar',
    user_agent='myTime')
else:
  decorator = OAuth2Decorator(
    client_id='100813449163-26s1qdti9fukt0up65lljpg24oijl33d.apps.googleusercontent.com',
    client_secret='E6xiDmvf_cB6RF8WaqYj13Hf',
    scope='https://www.googleapis.com/auth/calendar',
    user_agent='myTime')
  
service = build('calendar', 'v3')
