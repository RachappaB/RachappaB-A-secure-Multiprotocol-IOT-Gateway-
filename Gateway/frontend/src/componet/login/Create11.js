import React, { Component } from 'react';
import { Button, Container } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Create11 = () => {
  const { id } = useParams(); // Get the project ID from the URL
  const [apiUrls, setApiUrls] = React.useState({writesecureurl: '' ,writeUrl: '', limitUlr:'',readUrl: '',readsecureurl: '' , });

  React.useEffect(() => {
    const fetchApiUrls = async () => {
      try {
        const response = await axios.get(`/project/api-urls/${id}`);
        setApiUrls(response.data);
      } catch (error) {
        console.error('Error fetching API URLs:', error);
      }
    };

    fetchApiUrls();
  }, [id]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  return (
    <Container className="mt-5">
      <div className="mt-5">
        <h1>API URLs</h1>
        <div className="p-3 mb-3 border rounded">
          <h5>REST API Write by xor security</h5>
          <p>{apiUrls.writesecureurl}</p>
          <Button variant="outline-primary" onClick={() => handleCopy(apiUrls.writesecureurl)}>Copy</Button>
        </div>
        <div className="p-3 mb-3 border rounded">
          <h5>REST API read by xor security</h5>
          <p>{apiUrls.readsecureurl}</p>
          <Button variant="outline-primary" onClick={() => handleCopy(apiUrls.readsecureurl)}>Copy</Button>
        </div>
        <div className="p-3 mb-3 border rounded">
          <h5>REST API Write</h5>
          <p>{apiUrls.writeUrl}</p>
          <Button variant="outline-primary" onClick={() => handleCopy(apiUrls.writeUrl)}>Copy</Button>
        </div>
        <div className="p-3 mb-3 border rounded">
          <h5>REST API Write</h5>
          <p>{apiUrls.writeUrl}</p>
          <Button variant="outline-primary" onClick={() => handleCopy(apiUrls.writeUrl)}>Copy</Button>
        </div>
        <div className="p-3 mb-3 border rounded">
          <h5>REST API Write</h5>
          <p>{apiUrls.writeUrl}</p>
          <Button variant="outline-primary" onClick={() => handleCopy(apiUrls.writeUrl)}>Copy</Button>
        </div>
        <div className="p-3 mb-3 border rounded">
          <h5>REST API Read by limit</h5>
          <p>{apiUrls.limitUlr}</p>
          <Button variant="outline-primary" onClick={() => handleCopy(apiUrls.limitUlr)}>Copy</Button>
        </div>

        <div className="p-3 mb-3 border rounded">
          <h5>REST API Read</h5>
          <p>{apiUrls.readUrl}</p>
          <Button variant="outline-primary" onClick={() => handleCopy(apiUrls.readUrl)}>Copy</Button>
          <Button variant="outline-primary" onClick={() => handleCopy(apiUrls.readUrl)}>code</Button>

        </div>
      </div>
    </Container>
  );
};

export default Create11;
