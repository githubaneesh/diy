#!/bin/sh
echo "User info for userid: $USER"
bucketname="qa.looklook-app.com"
buildfolder="build/"
distributionid="E39ULDLM4J9VDA"
echo "starting production build....."
#npm run build
echo "Build completed....."
echo "Starting to remove objects from bucket $bucketname"
aws s3 rm --recursive s3://$bucketname 
echo "Bucket cleared " 
echo "starting to upload to s3 bucket"
aws s3 sync $buildfolder s3://$bucketname
echo "deploy completed..."

#scp -i ~/.ssh/looklookapiv3.pem -r build/* ubuntu@18.206.35.133:~/dist
#ssh -i ~/.ssh/looklookapiv3.pem ubuntu@18.206.35.133 '
#scp -i ~/.ssh/looklookapiv3.pem -r build/* ubuntu@52.87.242.43:~/dist
#ssh -i ~/.ssh/looklookapiv3.pem ubuntu@52.87.242.43 '
#cd /var/www/html
#sudo rm -rf /var/www/html/* || true
#sudo mv /home/ubuntu/dist/* .
#echo "successfully deployed the changes."
#exit'
