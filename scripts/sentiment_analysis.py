'''
Script to perform sentiment analysis on restaurant reviews
'''
import json
import time
from textblob import TextBlob
import csv

# get restaurants from json file
with open("cities.json", "r") as f:
    restaurants = json.load(f)
    
# get business IDs of all restaurants and store in hash table
business_ids = {}
for i in range(3):
    for each_restaurant in restaurants["children"][i]["children"]:
        business_ids[each_restaurant["business_id"]] = 1
        
# create hash table for mapping user ID to number of fans the user has
users = {}
with open("user.json", "r") as f:
    for line in f:
        temp = json.loads(line)
        users[temp["user_id"]] = temp["fans"]
        
# extract relevant review information based on business IDs
reviews = {}
with open("review.json", "r") as f:
    for line in f:
        temp = json.loads(line)
        try:
            if(business_ids[temp["business_id"]] == 1):
                sentiment_polarity = TextBlob(temp["text"]).sentiment.polarity
                year = time.strptime(temp["date"], "%Y-%m-%d %H:%M:%S")[0]
                fans = users[temp["user_id"]]
                
                single_review = {
                    "review_id": temp["review_id"],
                    "sentiment_polarity": sentiment_polarity,
                    "review_year": year,
                    "useful_votes": temp["useful"],
                    "#_of_user_fans": fans
                }
                
                try:
                    reviews[temp["business_id"]].append(single_review)
                except:
                    reviews[temp["business_id"]] = [single_review]
        except:
            pass
        
# sort reviews by usefulness and only take top 250 for each restaurant
for each_restaurant in reviews:
    temp = reviews[each_restaurant]
    temp = sorted(temp, key = lambda x: x["useful_votes"])
    temp = temp[::-1]
    temp = temp[:250]
    reviews[each_restaurant] = temp
    
# write review information to csv file for each restaurant
for each_restaurant in reviews:
    with open(each_restaurant + ".csv", "w", newline = "") as f:
        writer = csv.writer(f)
        writer.writerow(["review_id", "sentiment_polarity", "review_year", "useful_votes", "#_of_user_fans"])
        
        for each_review in reviews[each_restaurant]:
            row = [
                each_review["review_id"],
                each_review["sentiment_polarity"],
                each_review["review_year"],
                each_review["useful_votes"],
                each_review["#_of_user_fans"]
            ]
            writer.writerow(row)