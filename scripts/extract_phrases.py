'''
Script to extract most frequently used phrases from restaurant reviews
'''
import json
from textblob import TextBlob
import time

# get restaurants from json file
with open("cities.json", "r") as f:
    restaurants = json.load(f)
    
# get business IDs of all restaurants and store in hash table
business_ids = {}
for i in range(3):
    for each_restaurant in restaurants["children"][i]["children"]:
        business_ids[each_restaurant["business_id"]] = 1
        
# extract relevant review information based on business IDs
reviews = {}
with open("review.json", "r") as f:
    for line in f:
        temp = json.loads(line)
        try:
            if(business_ids[temp["business_id"]] == 1):
                
                single_review = {
                    "text": temp["text"],
                    "useful": temp["useful"],
                    "date": temp["date"]
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
    temp = sorted(temp, key = lambda x: x["useful"], reverse = True)
    temp = temp[:250]
    reviews[each_restaurant] = temp
    
# extract top 10 most frequently used phrases by year from reviews and write to json file for each restaurant
for each_restaurant in reviews:
    years = {}
    
    for each_review in reviews[each_restaurant]:
        year = time.strptime(each_review["date"], "%Y-%m-%d %H:%M:%S")[0]
        years[year] = {}
    
    for each_review in reviews[each_restaurant]:
        text = each_review["text"]
        blob = TextBlob(text)
        year = time.strptime(each_review["date"], "%Y-%m-%d %H:%M:%S")[0]
        
        for each_phrase in blob.noun_phrases:
            try:
                years[year][each_phrase] += 1
            except:
                years[year][each_phrase] = 1
    
    for year in years:
        temp = years[year]
        temp = sorted(temp.items(), key = lambda x: x[1], reverse = True)
        temp = temp[:10]
        years[year] = temp
        
    root = {
        "name": "Phrases",
        "children": []
    }
    
    for year in years:
        child = {
            "name": year,
            "children": years[year]
        }
        root["children"].append(child)

    with open(each_restaurant + ".json", "w") as f:
        json.dump(root, f)