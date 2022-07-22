echo "User info for userid: $USER"
bucketname="looklook-app.com"
buildfolder="build/"
distributionid="EDI2U7FF306P5"
echo "starting production build....."
npm run build
echo "Build completed....."
echo "Starting to remove objects from bucket $bucketname"
aws s3 rm --recursive s3://$bucketname 
echo "Bucket cleared " 
echo "starting to upload to s3 bucket"
aws s3 sync $buildfolder s3://$bucketname
echo "deploy completed..."

# npm run build
# scp -i ~/.ssh/looklookapiv3.pem -r build/* ubuntu@3.82.200.103:~/dist
# ssh -i ~/.ssh/looklookapiv3.pem ubuntu@3.82.200.103 '
# cd /var/www/html
# sudo rm -rf /var/www/html/* || true
# sudo mv /home/ubuntu/dist/* .
# echo "successfully deployed the changes."
# exit'