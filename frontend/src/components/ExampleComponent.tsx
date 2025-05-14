import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Text, Card, Input, Icon, ListItem } from '@rneui/themed';

export const ExampleComponent = () => {
  const [text, setText] = useState('');

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        <Text h3 style={{ marginBottom: 20 }}>中医考试助手</Text>
        
        {/* 卡片示例 */}
        <Card>
          <Card.Title>功能展示</Card.Title>
          <Card.Divider />
          <Text>这是一个使用 React Native Elements 的示例</Text>
          <Button
            title="开始学习"
            icon={{
              name: 'book',
              type: 'font-awesome',
              color: 'white'
            }}
            buttonStyle={{
              backgroundColor: '#4A90E2',
              borderRadius: 5,
              marginTop: 10
            }}
            onPress={() => console.log('Button pressed')}
          />
        </Card>

        {/* 输入框示例 */}
        <Input
          placeholder='请输入搜索内容'
          value={text}
          onChangeText={setText}
          leftIcon={{ type: 'font-awesome', name: 'search' }}
          containerStyle={{ marginTop: 20 }}
        />

        {/* 列表示例 */}
        <ListItem bottomDivider>
          <Icon name='book' type='font-awesome' />
          <ListItem.Content>
            <ListItem.Title>题库练习</ListItem.Title>
            <ListItem.Subtitle>包含常见中医考试题目</ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>

        <ListItem bottomDivider>
          <Icon name='chart-line' type='font-awesome-5' />
          <ListItem.Content>
            <ListItem.Title>学习统计</ListItem.Title>
            <ListItem.Subtitle>查看学习进度和成绩</ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      </View>
    </ScrollView>
  );
}; 