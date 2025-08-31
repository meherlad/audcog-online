# AudCog Online

A web-based auditory cognitive assessment platform built with Firebase.

## Overview

AudCog Online is a comprehensive web application for conducting auditory cognitive assessments. The platform includes various cognitive tests and questionnaires designed to evaluate auditory processing and cognitive function.

## Features

- **Multiple Assessment Modules**: Includes various cognitive tests and questionnaires
- **Audio Integration**: Supports audio stimuli for auditory assessments
- **Responsive Design**: Works across different devices and screen sizes
- **Firebase Backend**: Secure data storage and real-time functionality
- **User Management**: Participant tracking and data management

## Project Structure

```
audcog-online/
├── public/                 # Web application files
│   ├── js/                # JavaScript files for different modules
│   ├── static/            # Static assets (audio, images, videos)
│   └── *.html             # HTML pages for different assessments
├── firebase.json          # Firebase configuration
├── database.rules.json    # Firebase Realtime Database rules
└── .gitignore            # Git ignore rules
```

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/meherlad/audcog-online.git
   cd audcog-online
   ```

2. **Firebase Setup**:
   - Create a Firebase project
   - Update `.firebaserc` with your project ID
   - Configure Firebase credentials (not included in repo for security)

3. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```

## Security Notes

- Sensitive files including Firebase credentials and analysis data are excluded from version control
- The `analysis/` folder contains research data and is not included in the repository
- Firebase configuration files are included but credentials are managed separately

## Development

The application is built using vanilla HTML, CSS, and JavaScript with Firebase as the backend. Each assessment module has its own HTML file and corresponding JavaScript file in the `public/js/` directory.

## License

This project is for research purposes. Please contact the development team for usage permissions.

## Contact

For questions or support, please contact the development team.
