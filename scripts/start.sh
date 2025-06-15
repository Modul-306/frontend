#!/bin/bash

# Generate environment configuration file
cat > /usr/share/nginx/html/assets/env.js << EOF
window.env = {
  API_URL: '${API_URL}'
};
EOF

# Start nginx
nginx -g 'daemon off;'
