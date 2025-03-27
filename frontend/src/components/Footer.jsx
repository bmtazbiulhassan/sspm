import '../css/Footer.css';


function Footer() {
  return (
    <footer className="footer">
      <div>
        Developed by{' '}
        <a
          href="https://www.linkedin.com/in/bmtazbiulhassan/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>B M Tazbiul Hassan Anik</strong> 
        </a>
      </div>
      <div>
        Supported by{' '}
        <a
          href="https://smartsafe.ucf.edu/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>UCF Smart & Safe Transportation Lab (UCF SST)</strong>
        </a>{' '}
        and {' '}
        <a
          href='https://www.fdot.gov/'
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>Florida Department of Transportation (FDOT)</strong>
        </a>
      </div>
    </footer>
  );
}

export default Footer