# Evaluator for Prisoner's Dilemma Strategies

This is a simple evaluator for Prisoner's Dilemma strategies. It takes in python code that defines a strategy and pits it against other strategies in a round-robin tournament. The strategies are evaluated based on the total score they achieve in the tournament.

**Demo**: [https://prisoners-dilemma-evaluator.vercel.app/](https://prisoners-dilemma-evaluator.vercel.app/)

## Usage

To evaluate a strategy, you need to define a python script that outputs the first move of the strategy and takes in the subsequent moves of the opponent. The outputs of the code should be `cooperate` or `defect`. After set number of rounds, the program will be terminated by sending a `stop` to its `stdin`.

Here is an example of a simple strategy:

```python
import random

print("cooperate", end="\n")

inp = input()

while inp != "stop":
    print(random.choice(["cooperate", "defect"]), end="\n")
    inp = input()
```

Example `stdin`:

```text
cooperate
defect
cooperate
defect
stop
```

> As the input has 5 lines, the strategy will play 5 rounds of the game, one blind move and 4 moves against the opponent. There must be a total of 5 lines in the output.

### Submission

To submit a strategy, send a POST request to the server with the following parameters:

```
POST /strategies
```

```json
{
    "email": "user@domain.com",
    "code": "python_strategy_code"
}
```

To evaluate a strategy, send a POST request to the server with the following parameters:

```
POST /trigger-evaluation
```

```json
{
  "strategyId": "strategy_id"
}
```

The server will respond with the evaluation results.

## Author

- [Krushn Dayshmookh](https://github.com/krushndayshmookh)

## Contributing

Feel free to contribute to this project by creating a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Prisoner's Dilemma](https://en.wikipedia.org/wiki/Prisoner%27s_dilemma)
- [Axelrod-Python](https://github.com/Axelrod-Python/Axelrod)
