# 911 Calls avec ElasticSearch

## Import du jeu de données

Pour importer le jeu de données, complétez le script `import.js` (ici aussi, cherchez le `TODO` dans le code :wink:).

Exécutez-le ensuite :

```bash
npm install
node import.js
```

Vérifiez que les données ont été importées correctement grâce au shell (le nombre total de documents doit être `153194`) :

```
GET <nom de votre index>/_count
```

## Requêtes

### Nombre d'appels autour de Landscale dans un rayon de 500 mètres

```
GET 911/call/_search
{
    "size": 0,
    "query": {
        "bool" : {
            "must" : {
                "match_all" : {}
            },
            "filter" : {
                "geo_distance" : {
                    "distance" : "500m",
                    "coordinates" : {
                        "lon" : -75.283783,
                        "lat" :  40.241493
                    }
                }
            }
        }
    }
}

# Résultat
"hits": {
    "total": 717,
    "max_score": 0,
    "hits": []
}
```

### Nombre d'appels par catégorie

```
GET 911/call/_search
{
  "size": 0, 
  "aggs" :{
    "total_count" : {
      "global" : {}
    },
    "EMS" : {
      "filter" : {
        "regexp":{
            "category" : "ems"
        }
      } 
    },
    "Fire" : {
      "filter" : {
        "regexp":{
            "category" : "fire"
        }
      } 
    },
    "Traffic" : {
    "filter" : {
       "regexp":{
           "category" : "traffic"
        }
      } 
    }
  }
}

# Résultat
"aggregations": {
    "total_count": {
      "doc_count": 153194
    },
    "Traffic": {
      "doc_count": 54549
    },
    "Fire": {
      "doc_count": 23056
    },
    "EMS": {
      "doc_count": 75589
    }
}
```


### Les trois mois ayant comptabilisés le plus d'appel

```
GET 911/call/_search
{
  "size" : 0,
  "aggs" : {
    "calls" : {
      "date_histogram" : {
        "field" : "date",
        "interval" : "month",
        "order" : { "_count" : "desc" }
      }
    }
  }
}

# Résultat
"aggregations": {
    "calls": {
      "buckets": [
        {
          "key_as_string": "2016-01-01T00:00:00.000Z",
          "key": 1451606400000,
          "doc_count": 13084
        },
        {
          "key_as_string": "2016-10-01T00:00:00.000Z",
          "key": 1475280000000,
          "doc_count": 12502
        },
        {
          "key_as_string": "2016-12-01T00:00:00.000Z",
          "key": 1480550400000,
          "doc_count": 12162
        },
        {
          "key_as_string": "2016-11-01T00:00:00.000Z",
          "key": 1477958400000,
          "doc_count": 12092
        },
        {
          "key_as_string": "2016-07-01T00:00:00.000Z",
          "key": 1467331200000,
          "doc_count": 12074
        },
        {
          "key_as_string": "2016-08-01T00:00:00.000Z",
          "key": 1470009600000,
          "doc_count": 11910
        },
        {
          "key_as_string": "2016-06-01T00:00:00.000Z",
          "key": 1464739200000,
          "doc_count": 11746
        },
        {
          "key_as_string": "2016-09-01T00:00:00.000Z",
          "key": 1472688000000,
          "doc_count": 11669
        },
        {
          "key_as_string": "2016-02-01T00:00:00.000Z",
          "key": 1454284800000,
          "doc_count": 11394
        },
        {
          "key_as_string": "2016-05-01T00:00:00.000Z",
          "key": 1462060800000,
          "doc_count": 11368
        },
        {
          "key_as_string": "2016-04-01T00:00:00.000Z",
          "key": 1459468800000,
          "doc_count": 11280
        },
        {
          "key_as_string": "2016-03-01T00:00:00.000Z",
          "key": 1456790400000,
          "doc_count": 11074
        },
        {
          "key_as_string": "2015-12-01T00:00:00.000Z",
          "key": 1448928000000,
          "doc_count": 7935
        },
        {
          "key_as_string": "2017-01-01T00:00:00.000Z",
          "key": 1483228800000,
          "doc_count": 2904
        }
      ]
    }
  }
```

### Top 3 des villes avec le plus d'appels pour overdose

```
GET /911/call/_search
{
    "size" : 0,
    "query" : {
      "term" : {
        "event" : "overdose"
      } 
    },
    "aggs" : {
        "overdoses" : {
            "terms": {
                "field": "neighbourhood.keyword",
                "order": {
                    "_count" : "desc" 
                }
            }
        }
    }
}

#Résultat
"aggregations": {
    "overdoses": {
      "doc_count_error_upper_bound": 24,
      "sum_other_doc_count": 929,
      "buckets": [
        {
          "key": "POTTSTOWN",
          "doc_count": 203
        },
        {
          "key": "NORRISTOWN",
          "doc_count": 180
        },
        {
          "key": "UPPER MORELAND",
          "doc_count": 110
        },
        {
          "key": "LOWER MERION",
          "doc_count": 104
        },
        {
          "key": "ABINGTON",
          "doc_count": 95
        },
        {
          "key": "UPPER MERION",
          "doc_count": 72
        },
        {
          "key": "LANSDALE",
          "doc_count": 71
        },
        {
          "key": "CHELTENHAM",
          "doc_count": 68
        },
        {
          "key": "LOWER PROVIDENCE",
          "doc_count": 61
        },
        {
          "key": "PLYMOUTH",
          "doc_count": 55
        }
      ]
    }
  }
```

## Kibana

Dans Kibana, créez un dashboard qui permet de visualiser :

* Une carte de l'ensemble des appels
* Un histogramme des appels répartis par catégories
* Un Pie chart réparti par bimestre, par catégories et par canton (township)

Pour nous permettre d'évaluer votre travail, ajoutez une capture d'écran du dashboard dans ce répertoire [images](images).

### Timelion
Timelion est un outil de visualisation des timeseries accessible via Kibana à l'aide du bouton : ![](images/timelion.png)

Réalisez le diagramme suivant :
![](images/timelion-chart.png)

#### Requête  

Pour avoir le même affichage, il faut set la timeline entre le 15 Juillet 2016 et le 15 Janvier 2017 avec un pas de 1 semaine (au dessus du bouton go).

```
.es( index=911*, q=category:fire, timefield=date).cusum().label(label="Last 6 months of 'Fire' calls").color(#FF5607),
.es( index=911*, q=category:fire, timefield=date, offset=-6M).cusum().label(label="Previous 6 months of 'Fire' calls").color(#FFB840),
.static(6500, "Objective").color(#00A4A5).lines(fill=1)
```
