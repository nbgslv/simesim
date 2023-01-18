import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookMessengerIcon,
  FacebookMessengerShareButton,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  PocketIcon,
  PocketShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TumblrIcon,
  TumblrShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from 'react-share';
import styles from './ShareButton.module.scss';

const ShareButton = ({ url, title }: { url: string; title: string }) => (
  <Dropdown className={styles.dropdown}>
    <Dropdown.Toggle variant="primary" id="dropdown-basic">
      <FontAwesomeIcon icon={solid('share-nodes')} />
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <Dropdown.Item as="div">
        <WhatsappShareButton
          url={url}
          title={title}
          className="d-flex justify-content-between align-items-center p-2"
        >
          Whatsapp
          <WhatsappIcon style={{ width: '2.5rem', height: '2.5rem' }} />
        </WhatsappShareButton>
      </Dropdown.Item>
      <Dropdown.Item as="div">
        <FacebookShareButton
          url={url}
          className="d-flex justify-content-between align-items-center p-2"
        >
          Facebook
          <FacebookIcon style={{ width: '2.5rem', height: '2.5rem' }} />
        </FacebookShareButton>
      </Dropdown.Item>
      <Dropdown.Item as="div">
        <FacebookMessengerShareButton
          appId={process.env.NEXT_PUBLIC_FB_APP_ID as string}
          url={url}
          className="d-flex justify-content-between align-items-center p-2"
        >
          Messenger
          <FacebookMessengerIcon
            style={{ width: '2.5rem', height: '2.5rem' }}
          />
        </FacebookMessengerShareButton>
      </Dropdown.Item>
      <Dropdown.Item as="div">
        <TwitterShareButton
          url={url}
          title={title}
          className="d-flex justify-content-between align-items-center p-2"
        >
          Twitter
          <TwitterIcon style={{ width: '2.5rem', height: '2.5rem' }} />
        </TwitterShareButton>
      </Dropdown.Item>
      <Dropdown.Item as="div">
        <EmailShareButton
          url={url}
          subject={title}
          body="תראו מה מצאתי ב-שים eSim:"
          className="d-flex justify-content-between align-items-center p-2"
        >
          דוא&quot;ל
          <EmailIcon style={{ width: '2.5rem', height: '2.5rem' }} />
        </EmailShareButton>
      </Dropdown.Item>
      <Dropdown.Item as="div">
        <LinkedinShareButton
          url={url}
          title={title}
          source={url}
          className="d-flex justify-content-between align-items-center p-2"
        >
          LinkedIn
          <LinkedinIcon style={{ width: '2.5rem', height: '2.5rem' }} />
        </LinkedinShareButton>
      </Dropdown.Item>
      <Dropdown.Item as="div">
        <TelegramShareButton
          url={url}
          title={title}
          className="d-flex justify-content-between align-items-center p-2"
        >
          Telegram
          <TelegramIcon style={{ width: '2.5rem', height: '2.5rem' }} />
        </TelegramShareButton>
      </Dropdown.Item>
      <Dropdown.Item as="div">
        <RedditShareButton
          url={url}
          title={title}
          className="d-flex justify-content-between align-items-center p-2"
        >
          Reddit
          <RedditIcon style={{ width: '2.5rem', height: '2.5rem' }} />
        </RedditShareButton>
      </Dropdown.Item>
      <Dropdown.Item as="div">
        <TumblrShareButton
          url={url}
          className="d-flex justify-content-between align-items-center p-2"
        >
          Tumblr
          <TumblrIcon style={{ width: '2.5rem', height: '2.5rem' }} />
        </TumblrShareButton>
      </Dropdown.Item>
      <Dropdown.Item as="div">
        <PocketShareButton
          url={url}
          title={title}
          className="d-flex justify-content-between align-items-center p-2"
        >
          Pocket
          <PocketIcon style={{ width: '2.5rem', height: '2.5rem' }} />
        </PocketShareButton>
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

export default ShareButton;
